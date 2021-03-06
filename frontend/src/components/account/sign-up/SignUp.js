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

import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import "./SignUp.css";
import Button from "react-bootstrap/Button";
import { getDietaryRequirements } from "../../../utils/DietaryRequirements";
import { backButton } from "../../utils/Utilities";
import Walkthrough from "../../login/Walkthrough";
import Toast from "react-bootstrap/Toast";
import AccountHeader from "../../header/AccountHeader";

class SignUp extends Component {
  constructor(properties) {
    super(properties);
    const propertiesState = properties.location.state;
    const isSignUp = propertiesState === undefined;

    this.state = {
      name: isSignUp ? "" : propertiesState.name,
      diets: isSignUp ? [] : propertiesState.diets,
      allergies: isSignUp ? [] : propertiesState.allergies,
      isSignUp: isSignUp,
      showModal: false,
      showToast: true,
    };

    this.addAllergy = this.addAllergy.bind(this);
    this.removeAllergy = this.removeAllergy.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleDietChange = this.handleDietChange.bind(this);
    this.handleAllergyChange = this.handleAllergyChange.bind(this);
    this.setShowModal = this.setShowModal.bind(this);
    this.closeModalAndToast = this.closeModalAndToast.bind(this);
    this.closeToast = this.closeToast.bind(this);
  }

  render() {
    const title = this.state.isSignUp ? "Sign Up" : "Change account details";
    const redirectLink = this.state.isSignUp ? "/home" : "/account";

    return (
      <div>
        {this.getBackButtonIfChangeAccountDetails()}
        {this.getWalkthroughIfSignUp()}
        {this.state.isSignUp ? "" : <AccountHeader />}
        <div className="centered-container">
          <h1>{title}</h1>
          <Form action="/api/account" method="POST">
            <Form.Control
              type="hidden"
              name="redirectLink"
              value={redirectLink}
            />
            <Form.Group>
              <Form.Label>Name/Nickname</Form.Label>
              <Form.Control
                required
                type="text"
                name="name"
                placeholder="Enter your name/nickname"
                value={this.state.name}
                onChange={this.handleNameChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Dietary Requirements</Form.Label>
              {getDietaryRequirements().map((item, index) => (
                <Form.Check
                  key={index}
                  type="checkbox"
                  name="diets"
                  checked={this.state.diets.includes(item.value)}
                  onChange={this.handleDietChange}
                  value={item.value}
                  label={item.label}
                />
              ))}
              {this.state.allergies.map((item, index) => (
                <div key={index} className="custom-diet-div">
                  <Form.Control
                    className="custom-diet-input"
                    type="text"
                    name="allergies"
                    placeholder="Enter allergy/food you can't eat"
                    value={item}
                    onChange={(event) => this.handleAllergyChange(event, index)}
                  ></Form.Control>
                  <Button
                    className="custom-diet-remove-btn"
                    onClick={() => this.removeAllergy(index)}
                    variant="outline-danger"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                className="add-diet-btn w-100"
                variant="outline-primary"
                onClick={this.addAllergy}
              >
                Add allergy/food I can't eat
              </Button>
            </Form.Group>
            <Button className="w-100" variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      </div>
    );
  }

  getBackButtonIfChangeAccountDetails() {
    if (!this.state.isSignUp) {
      return backButton();
    }
  }

  getWalkthroughIfSignUp() {
    if (this.state.isSignUp) {
      return (
        <div>
          <Walkthrough
            handleClose={this.closeModalAndToast}
            showModal={this.state.showModal}
          />
          <div className="text-center">
            <Toast show={this.state.showToast}>
              <Toast.Header>
                Do you want to see how Recipe Finder works?
              </Toast.Header>
              <Toast.Body>
                <Button variant="link" onClick={this.setShowModal}>
                  Yes
                </Button>
                <Button variant="" onClick={this.closeToast}>
                  No
                </Button>
              </Toast.Body>
            </Toast>
          </div>
        </div>
      );
    }
  }

  closeToast() {
    this.setState({ showToast: false });
  }

  closeModalAndToast() {
    this.setState({ showModal: false, showToast: false });
  }

  setShowModal() {
    this.setState({ showModal: true });
  }
  
  addAllergy() {
    const previousAllergies = this.state.allergies;
    previousAllergies.push("");
    this.setState({ allergies: previousAllergies });
  }

  removeAllergy(index) {
    const previousAllergies = this.state.allergies;
    previousAllergies.splice(index, 1);
    this.setState({ allergies: previousAllergies });
  }

  handleNameChange(event) {
    const newName = event.target.value;
    this.setState({ name: newName });
  }

  handleDietChange(event) {
    const isChecked = event.target.checked;
    const value = event.target.value;
    const diets = this.state.diets;

    if (isChecked) {
      diets.push(value);
    } else {
      diets.pop(value);
    }
    this.setState({ diets: diets });
  }

  handleAllergyChange(event, index) {
    const diet = event.target.value;
    const diets = this.state.allergies;
    diets[index] = diet;
    this.setState({ allergies: diets });
  }
}
export default SignUp;
