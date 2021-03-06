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

import React from "react";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { Recipe } from "../../recipe/Recipe";
import "../favourites/Favourites.css";
import { loading } from "../../utils/Utilities";
import ComponentWithHeader from "../../header/ComponentWithHeader";

class History extends ComponentWithHeader {
  constructor(properties) {
    super(properties);
    this.state = {
      recipes: [],
      error: null,
      loading: true,
    };
  }

  componentDidMount() {
    fetch("/api/history")
      .then((response) => response.json())
      .then((json) => this.setState({ recipes: json }))
      .catch((error) => this.setState({error: error}))
      .finally(() => this.setState({ loading: false }));
  }

  renderContent() {
    if (this.state.loading) {
      return loading("Getting your history ...");
    }

    return (
      <div>
        <div className="centered-container">
          <h1 className="account-page-title">History</h1>
          <p>{this.getMessageIfNoHistory()}</p>
          {this.state.recipes.map((recipe, index) => {
            const button = (
              <div className="right-side-btn">
                <Link to={{ pathname: "/cook", state: { recipe: recipe } }}>
                  <Button className="lets-go-btn" variant="primary">
                    Let's Go!
                  </Button>
                </Link>
              </div>
            );
            return <Recipe key={index} recipe={recipe} buttons={button} />;
          })}
        </div>
      </div>
    );
  }

  getMessageIfNoHistory() {
    if (this.state.recipes.length === 0) {
      return "You didn't make anything yet :(";
    }
  }
}
export default History;
