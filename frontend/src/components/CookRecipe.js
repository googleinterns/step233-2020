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

// MIT License

// Copyright (c) Facebook, Inc. and its affiliates.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// The MIT License (MIT)

// Copyright (c) 2014-present Stephen J. Collings, Matthew Honnibal, Pieter Vanderwerff

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import Button from "react-bootstrap/Button";
import Carousel from "react-bootstrap/Carousel";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import "./CookRecipe.css";
import navigateNext from "../icons/navigate_next.svg";
import navigatePrevious from "../icons/navigate_previous.svg";
import speakerOn from "../icons/speaker-on.svg";
import speakerOff from "../icons/speaker-off.svg";

class CookRecipe extends Component {
  constructor(properties) {
    super(properties);
    this.state = {
      recipe: JSON.parse(localStorage.getItem("recipe")),
      isLastStep: false,
      isSpeakerOff: true,
    };
    this.switchSpeaker = this.switchSpeaker.bind(this);
  }

  componentDidMount() {
    this.noteIfLastStep();
  }

  render() {
    const recipe = this.state.recipe;
    return (
      <div>
        <Link to="/recommendations">
          <Button variant="" className="back-btn">
            <img src={navigatePrevious} alt="go back to recommendations" />
            Back
          </Button>
        </Link>
        <h1>{recipe.name}</h1>
        <Tabs defaultActiveKey="tutorial">
          <Tab eventKey="ingredients" title="Ingredients">
            <div className="tab-content">
              <ul>
                {recipe.ingredients.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </Tab>
          <Tab eventKey="full-recipe" title="Full recipe">
            <div className="tab-content">
              <ol>
                {recipe.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </Tab>
          <Tab eventKey="tutorial" title="Tutorial">
            <div className="tab-content">
              <div className="centered-div">
                <Button
                  variant="primary"
                  onClick={this.switchSpeaker}
                >
                  <img src={this.getSpeakerIcon()} alt="switch speaker" />
                  <div></div>
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
                {recipe.instructions.map((step, i) => (
                  <Carousel.Item key={i} className="carousel-step">
                    {step}
                  </Carousel.Item>
                ))}
              </Carousel>
              {this.displayFinishedIfLastStep()}
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }

  setSelectedStepAndMaybeRead = (selectedIndex, e) => {
    localStorage.setItem("tutorial-step", selectedIndex);
    this.noteIfLastStep();
    if (this.state.isSpeakerOff) {
      return;
    }
    // to do : read the step
  };

  getSelectedStep() {
    const step = JSON.parse(localStorage.getItem("tutorial-step"));
    return step ? step : 0;
  }

  noteIfLastStep() {
    const step = this.getSelectedStep();
    const isLastStep = this.state.recipe.instructions.length === step + 1;
    this.setState({ isLastStep: isLastStep });
  }

  displayFinishedIfLastStep() {
    if (this.state.isLastStep) {
      return (
        <div className="centered-div">
          <Button onClick={this.finishCooking}>All done!</Button>
        </div>
      );
    }
  }

  switchSpeaker() {
    const previousStateIsSpeakerOff = this.state.isSpeakerOff;
    this.setState({ isSpeakerOff: !previousStateIsSpeakerOff });
  }

  finishCooking() {
    // to do
  }

  getSpeakerIcon() {
    return this.state.isSpeakerOff ? speakerOn : speakerOff;
  }

  getSpeakerMessage() {
    return this.state.isSpeakerOff
      ? "I want to hear the instructions"
      : "Don't read the instructions";
  }
}
export default CookRecipe;
