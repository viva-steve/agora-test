import React from "react";
import AgoraRTC from "agora-rtc-sdk";
import Call from "../components/Call";

var rtc = {
  client: null,
  joined: false,
  published: false,
  localStream: null,
  remoteStreams: [],
  params: {},
};

// Options for joining a channel
var option = {
  appID: "4d323211729a416ba592cba99e71b5a7",
  channel: "steve",
  uid: null,
  token:
    "0064d323211729a416ba592cba99e71b5a7IACPzRzQ4DDx6kdutLow564rdMBbLqAN5B/SCi9VMwxpX6UYrJYAAAAAEACRer0x7HmnYAEAAQDseadg",
  key: "",
  secret: "",
};

function joinChannel(role) {
  console.log("테스트", role);
  // Create a client
  rtc.client = AgoraRTC.createClient({ mode: "live", codec: "h264" });
  // Initialize the client
  rtc.client.init(
    option.appID,
    function() {
      console.log("init success");

      // Join a channel
      rtc.client.join(
        option.token ? option.token : null,
        option.channel,
        option.uid ? +option.uid : null,
        function(uid) {
          console.log(
            "join channel: " + option.channel + " success, uid: " + uid
          );
          rtc.params.uid = uid;
          if (role === "host") {
            rtc.client.setClientRole("host");
            // Create a local stream
            rtc.localStream = AgoraRTC.createStream({
              streamID: rtc.params.uid,
              audio: true,
              video: true,
              screen: false,
            });

            // Initialize the local stream
            rtc.localStream.init(
              function() {
                console.log("init local stream success");
                rtc.localStream.play("local_stream");
                rtc.client.publish(rtc.localStream, function(err) {
                  console.log("publish failed");
                  console.error(err);
                });
              },
              function(err) {
                console.error("init local stream failed ", err);
              }
            );

            rtc.client.on("connection-state-change", function(evt) {
              console.log("audience", evt);
            });
          }
          if (role === "audience") {
            rtc.client.on("connection-state-change", function(evt) {
              console.log("audience", evt);
            });

            rtc.client.on("stream-added", function(evt) {
              var remoteStream = evt.stream;
              var id = remoteStream.getId();
              if (id !== rtc.params.uid) {
                rtc.client.subscribe(remoteStream, function(err) {
                  console.log("stream subscribe failed", err);
                });
              }
              console.log("stream-added remote-uid: ", id);
            });

            rtc.client.on("stream-removed", function(evt) {
              var remoteStream = evt.stream;
              var id = remoteStream.getId();
              console.log("stream-removed remote-uid: ", id);
            });

            rtc.client.on("stream-subscribed", function(evt) {
              var remoteStream = evt.stream;
              var id = remoteStream.getId();
              remoteStream.play("remote_video_");
              console.log("stream-subscribed remote-uid: ", id);
            });

            rtc.client.on("stream-unsubscribed", function(evt) {
              var remoteStream = evt.stream;
              var id = remoteStream.getId();
              remoteStream.pause("remote_video_");
              console.log("stream-unsubscribed remote-uid: ", id);
            });
          }
        },
        function(err) {
          console.error("client join failed", err);
        }
      );
    },
    (err) => {
      console.error(err);
    }
  );
}

function leaveEventHost(params) {
  rtc.client.unpublish(rtc.localStream, function(err) {
    console.log("publish failed");
    console.error(err);
  });
  rtc.client.leave(function(ev) {
    console.log(ev);
  });
}

function leaveEventAudience(params) {
  rtc.client.leave(
    function() {
      console.log("client leaves channel");
      //……
    },
    function(err) {
      console.log("client leave failed ", err);
      //error handling
    }
  );
}

function LiveVideoStreaming(props) {
  return (
    <div>
      <button onClick={() => joinChannel("host")}>Join Channel as Host</button>
      <button onClick={() => joinChannel("audience")}>
        Join Channel as Audience
      </button>
      <button onClick={() => leaveEventHost("host")}>Leave Event Host</button>
      <button onClick={() => leaveEventAudience("audience")}>
        Leave Event Audience
      </button>
      <div
        id="local_stream"
        className="local_stream"
        style={{ width: "400px", height: "400px" }}
      ></div>
      <div id="remote_video_" style={{ width: "400px", height: "400px" }} />
    </div>
  );
}

export default LiveVideoStreaming;
