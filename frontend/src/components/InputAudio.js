/* Copyright 2020 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import React, {Component} from 'react';
import './InputText.css';
import MicRecorder from 'mic-recorder-to-mp3';


class InputAudio extends Component {
    constructor(properties) {
        super(properties);
        this.state = {
            isRecording: false,
            recorder: '',
            blobURL: '',
            isBlocked: false,
        };
        

    }
    start = () => {
          const Mp3Recorder = new MicRecorder({ bitRate: 128 });
          if (this.state.isBlocked) {
            console.log('Permission Denied');
          } else {
            Mp3Recorder
              .start()
              .then(() => {
                this.setState({ isRecording: true });
                this.setState({ recorder: Mp3Recorder });
              }).catch((e) => console.error(e));
          }
        };
    stop = () => {
        console.log(this.state.recorder);
        this.state.recorder
          .stop()
          .getMp3()
          .then(([buffer, blob]) => {
            const file = new File(buffer, 'ingredients.mp3', {
                type: blob.type,
                lastModified: Date.now()
            });
          const blobURL = URL.createObjectURL(file)
          localStorage.setItem("file", blobURL);
          this.setState({ blobURL, isRecording: false });
          }).catch((e) => console.log(e));
    };


    componentDidMount() {
      navigator.getUserMedia({ audio: true },
        () => {
            console.log('Permission Granted');
            this.setState({ isBlocked: false });
        },
        () => {
            console.log('Permission Denied');
            this.setState({ isBlocked: true })
        },
      );
    }
    render() {        
        return (
          <div className="audio">
            <button onClick={this.start} disabled={this.state.isRecording}>
            Record
            </button>
            <button onClick={this.stop} disabled={!this.state.isRecording}>
            Stop
            </button>
            <audio src={this.state.blobURL} controls="controls" />
            <a href={localStorage.getItem("file")} download="audioFile">download</a>
          </div>
        );
      }
    }
export default InputAudio;
