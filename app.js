let video;
let poseNet;
let speachRec;
let myVoice;
//start x and y
let leftWristX = 0;
let leftWristY = 0;
let rightWristX = 0;
let rightWristY = 0;

//toggel constants
let playTriger = true;
let pauseTriger = true;
let next = true;
let previous = true;

// setup function for creating video and canvas
function setup() {
  createCanvas(1540, 900);
  video = createCapture(VIDEO);
  video.size(1540, 900);
  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  // Hide the video element, and just show the canvas
  video.hide();
  poseNet.on("pose", gotPoses);

  //Create SpeachRec and Speech method
  let lang = navigator.language || "en-US";
  speachRec = new p5.SpeechRec(lang, gotSpeach); // new P5.SpeechRec object
  myVoice = new p5.Speech("Google UK English Male");
  let continous = true;
  let interim = false;
  speachRec.start(continous, interim);
}

function modelReady() {
  console.log("model ready");
}
// ********** Player functions
var Player = document.getElementById("player");
let times = 0,
  playY;
// play function will ad att autoplay to url
function play() {
  if (times == 0) {
    playY = Player.src += "?autoplay=1";
    times = 1;
  }
}
//pause will remove play and return original url
function pause() {
  if (times == 1) {
    playY = playY.slice(0, -11);
    Player.src = playY;
    times = 0;
  }
}
// got pose
function gotPoses(poses) {
  if (poses.length > 0) {
    let lwX = poses[0].pose.keypoints[9].position.x;
    let lwY = poses[0].pose.keypoints[9].position.y;
    let rwX = poses[0].pose.keypoints[10].position.x;
    let rwY = poses[0].pose.keypoints[10].position.y;

    // lerp function allowes me to make my moves nice and smoth
    leftWristX = lerp(leftWristX, lwX, 0.4);
    leftWristY = lerp(leftWristY, lwY, 0.4);
    rightWristX = lerp(rightWristX, rwX, 0.4);
    rightWristY = lerp(rightWristY, rwY, 0.4);

    //creation of containers for tracking diferent actions
    if (lwX > 1200 && lwX < 1500 && (lwY > 600 && lwY < 900)) {
      if (playTriger) {
        console.log("PLAY");
        playTriger = false;
        return play();
      }
    } else {
      playTriger = true;
    }

    if (lwX > 1200 && lwX < 1500 && (lwY > 50 && lwY < 350)) {
      if (pauseTriger) {
        console.log("pause");
        pauseTriger = false;
        return pause();
      }
    } else {
      pauseTriger = true;
    }

    if (rwX > 50 && rwX < 350 && (rwY > 50 && rwY < 350)) {
      if (next) {
        console.log("NEXT");
        next = false;
      }
    } else {
      next = true;
    }

    if (rwX > 50 && rwX < 350 && (rwY > 600 && rwY < 900)) {
      if (previous) {
        console.log("PREVIOUS");
        previous = false;
      }
    } else {
      previous = true;
    }
  }
}

function draw() {
  image(video, 0, 0, width, height);
  fill(255, 0, 0);
  ellipse(leftWristX, leftWristY, 50);

  fill(0, 0, 255);
  ellipse(rightWristX, rightWristY, 50);
}

//SPEACH BOT
let count = 0;
var msg;
function gotSpeach() {
  console.log(speachRec.resultString);
  console.log(count)
  if (speachRec.resultValue && count === 0) {
    msg = serchAndReply(speachRec.resultString);
    myVoice.speak(msg);
    return count = 1;
  }
  setTimeout(function() {
    return count = 0
  }, 3000);
}

//itarate over object and looking if str is a key, if ita true, send respound else send I dont understand
function serchAndReply(str) {
  let replies = {
    "hey Jarvis": "Hey, how are you today Max?",
    "Jarvis play": () => {return play()},
    "introduce yourself":
      "My name is Jarvis, I'm a smart player",
    "what can you do": "I can talk, play and pause video for you",
    "Jarvis are you smart":
      "Smarter then you. I know how to do binary search and u not",
    "how to do binary search":
      "I don't tell you",
    "thank you": "my pleasure"
  };
  for (let key in replies) {
    if (key === str) {
      return replies[str];
    }
  }

  return "Repeat again please";
}
