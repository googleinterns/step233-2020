// Copyright 2020 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Carousel from "react-bootstrap/Carousel";
import React, { Component } from "react";
import "./CookRecipe.css";
import navigateNext from "../../icons/navigate_next.svg";
import navigatePrevious from "../../icons/navigate_previous.svg";
import speakerOn from "../../icons/speaker-on.svg";
import speakerOff from "../../icons/speaker-off.svg";
import { Link } from "react-router-dom";

class Tutorial extends Component {
  constructor(properties) {
    super(properties);
    const isSpeakerOn = JSON.parse(sessionStorage.getItem("isSpeakerOn"));
    this.state = {
      isLastStep: false,
      isSpeakerOn: isSpeakerOn === null ? true : isSpeakerOn,
      audioSteps: new Array(properties.recipe.instructions.length),
      showModal: isSpeakerOn === null ? true : false,
    };
    this.switchSpeaker = this.switchSpeaker.bind(this);
  }

  componentDidMount() {
    this.noteIfLastStep();
    if (
      !this.state.showModal &&
      this.state.isSpeakerOn &&
      this.props.activeTab === "tutorial"
    ) {
      this.readStep(this.getSelectedStep());
    }
  }

  render() {
    return (
      <div>
        <Modal show={this.state.showModal} backdrop="static" keyboard={false}>
          <Modal.Header>
            <Modal.Title>
              Do you want the recipe to be read out loud?
            </Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Button variant="primary" onClick={() => this.handleClose(true)}>
              Yes
            </Button>
            <Button variant="secondary" onClick={() => this.handleClose(false)}>
              No
            </Button>
          </Modal.Footer>
        </Modal>

        <audio
          controls
          id="audio"
          style={{ display: this.state.isSpeakerOn ? "block" : "none" }}
        >
          <source src="" id="source" />
          Your browser does not support the audio element.
        </audio>
        <div className="centered-div">
          <Button variant="primary" onClick={this.switchSpeaker}>
            <img src={this.getSpeakerIcon()} alt="switch speaker" />
            {this.getSpeakerMessage()}
          </Button>
        </div>

        <Carousel
          interval={null} // to disable auto play of the carousel
          onSelect={this.setSelectedStepAndMaybeRead}
          defaultActiveIndex={this.getSelectedStep}
          nextIcon={
            <img
              src={navigateNext}
              alt="next step"
              className="carousel-control"
            />
          }
          prevIcon={
            <img
              src={navigatePrevious}
              alt="previous step"
              className="carousel-control"
            />
          }
        >
          {this.props.recipe.instructions.map((step, i) => (
            <Carousel.Item key={i} className="carousel-step">
              {step}
            </Carousel.Item>
          ))}
        </Carousel>
        {this.displayFinishedIfLastStep()}
      </div>
    );
  }

  handleClose(isSpeakerOn) {
    this.setState({ isSpeakerOn: isSpeakerOn, showModal: false });
    try {
      sessionStorage.setItem("isSpeakerOn", isSpeakerOn);
    } catch (error) {
      console.log(error);
    }
    if (isSpeakerOn && this.props.activeTab === "tutorial") {
      this.readStep(this.getSelectedStep());
    }
  }

  setSelectedStepAndMaybeRead = (selectedIndex, e) => {
    try {
      localStorage.setItem("tutorial-step", selectedIndex);
    } catch (error) {
      console.log(error);
    }
    this.noteIfLastStep();
    if (this.state.isSpeakerOn) {
      this.readStep(selectedIndex);
    }
  };

  getSelectedStep() {
    const step = JSON.parse(localStorage.getItem("tutorial-step"));
    return step ? step : 0;
  }

  readStep(index) {
    if (this.state.audioSteps[index] !== undefined) {
      this.playAudio(this.state.audioSteps[index]);
      return;
    }

    const step = this.props.recipe.instructions[index];
    const request = new Request("/api/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(step),
    });

    fetch(request)
      .then((response) => response.json())
      .then((json) => {
        const blob = new Blob([new Uint8Array(json)], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        this.state.audioSteps[index] = url;
        this.playAudio(url);
      })
      .catch((error) => console.log(error));
  }

  playAudio(url) {
    const audio = document.getElementById("audio");
    const source = document.getElementById("source");

    source.src = url;
    audio.load();
    var promise = audio.play();
    if (promise !== undefined) {
      promise
        .then((_) => {
          // autoplay started
        })
        .catch((error) => {
          console.log(error);
          // autoplay was prevented
        });
    }
  }

  noteIfLastStep() {
    const step = this.getSelectedStep();
    const isLastStep = this.props.recipe.instructions.length === step + 1;
    this.setState({ isLastStep: isLastStep });
  }

  displayFinishedIfLastStep() {
    if (this.state.isLastStep) {
      return (
        <div className="centered-div">
          <Link
            to={{
              pathname: "/finished",
              state: {
                recipeName: this.props.recipe.name,
                recipeId: this.props.recipe.recipeId,
              },
            }}
            onClick={() => this.finishCooking(this.props.recipe)}
          >
            <Button>All done!</Button>
          </Link>
        </div>
      );
    }
  }

  switchSpeaker() {
    const currentStateIsSpeakerOn = !this.state.isSpeakerOn;
    this.setState({ isSpeakerOn: currentStateIsSpeakerOn });
    try {
      sessionStorage.setItem("isSpeakerOn", currentStateIsSpeakerOn);
    } catch (error) {
      console.log(error);
    }
    if (currentStateIsSpeakerOn) {
      this.readStep(this.getSelectedStep());
    } else {
      // pause audio
      const audio = document.getElementById("audio");
      var promise = audio.pause();
      if (promise !== undefined) {
        promise
          .then((_) => {
            // audio paused
          })
          .catch((error) => {
            console.log(error);
            // pause was prevented
          });
      }
    }
  }

  finishCooking(recipe) {
    const request = new Request("/api/store-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(recipe),
    });
  }

  getSpeakerIcon() {
    return this.state.isSpeakerOn ? speakerOff : speakerOn;
  }

  getSpeakerMessage() {
    return this.state.isSpeakerOn ? "Don't read steps" : "Always read steps";
  }
}
export default Tutorial;
