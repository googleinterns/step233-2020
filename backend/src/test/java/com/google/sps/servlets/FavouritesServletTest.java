// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.users.UserService;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.gson.Gson;
import com.google.sps.data.Recipe;
import com.google.sps.utils.RecipeCollector;
import com.google.sps.utils.TestUtils;
import com.google.sps.utils.UserConstants;
import java.io.*;
import java.util.Collections;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

@RunWith(JUnit4.class)
public class FavouritesServletTest {
  private static final Gson GSON = new Gson();
  private static final Recipe RECIPE = TestUtils.createTestRecipe();

  private static final LocalServiceTestHelper DATASTORE_HELPER = TestUtils.getDatastoreHelper();

  private static DatastoreService datastore;

  @Mock HttpServletRequest request;
  @Mock HttpServletResponse response;
  @Mock UserService userService;

  @Before
  public void setUp() {
    DATASTORE_HELPER.setUp();
    datastore = DatastoreServiceFactory.getDatastoreService();
    MockitoAnnotations.openMocks(this);
    when(userService.getCurrentUser()).thenReturn(TestUtils.USER);
    when(userService.isUserLoggedIn()).thenReturn(true);
    datastore.put(TestUtils.getUserEntityWithName());
  }

  @After
  public void tearDown() {
    DATASTORE_HELPER.tearDown();
  }

  private FavouritesServlet getFavouritesServlet() {
    FavouritesServlet servlet = new FavouritesServlet();
    servlet.setUserServiceForTesting(userService);
    return servlet;
  }

  @Test
  public void getReturnsEmptyListIfNoFavouriteRecipes() throws Exception {
    FavouritesServlet favouritesServlet = getFavouritesServlet();
    Entity user = TestUtils.getUserEntityWithName();
    datastore.put(user);

    String result =
        TestUtils.getResultFromAuthenticatedGetRequest(favouritesServlet, request, response);
    assertEquals(GSON.toJson(Collections.emptyList()), result);
  }

  @Test
  public void getReturnsFavouriteRecipes() throws Exception {
    FavouritesServlet favouritesServlet = getFavouritesServlet();
    Entity user = TestUtils.getUserEntityWithName();
    user.setProperty(
        UserConstants.PROPERTY_FAVOURITES, Collections.singletonList(RECIPE.hashCode()));
    datastore.put(user);

    Entity recipe = TestUtils.createTestRecipeEntity();
    datastore.put(recipe);

    String result =
        TestUtils.getResultFromAuthenticatedGetRequest(favouritesServlet, request, response);
    assertEquals(GSON.toJson(Collections.singletonList(RECIPE)), result);
  }

  @Test
  public void postAddsRecipeToUserFavourites() throws Exception {
    Reader jsonReader = new StringReader(GSON.toJson(RECIPE.hashCode()));
    BufferedReader requestReader = new BufferedReader(jsonReader);
    when(request.getReader()).thenReturn(requestReader);
    FavouritesServlet favouritesServlet = getFavouritesServlet();
    favouritesServlet.doPost(request, response);

    Entity updatedUser = datastore.prepare(new Query(UserConstants.ENTITY_USER)).asSingleEntity();
    Entity expectedUser = TestUtils.getUserEntityWithName();
    expectedUser.setProperty(
        UserConstants.PROPERTY_FAVOURITES, Collections.singletonList(RECIPE.hashCode()));
    assertEquals(expectedUser, updatedUser);
  }

  @Test
  public void postDoesNotAddRecipeToFavouritesIfAlreadyExists() throws Exception {
    FavouritesServlet favouritesServlet = getFavouritesServlet();
    Entity user = TestUtils.getUserEntityWithName();
    user.setProperty(
        UserConstants.PROPERTY_FAVOURITES, Collections.singletonList(RECIPE.hashCode()));
    datastore.put(user);

    Reader jsonReader = new StringReader(GSON.toJson(RECIPE.hashCode()));
    BufferedReader requestReader = new BufferedReader(jsonReader);
    when(request.getReader()).thenReturn(requestReader);
    favouritesServlet.doPost(request, response);

    Entity updatedUser = datastore.prepare(new Query(UserConstants.ENTITY_USER)).asSingleEntity();
    Entity expectedUser = TestUtils.getUserEntityWithName();
    expectedUser.setProperty(
        UserConstants.PROPERTY_FAVOURITES, Collections.singletonList(RECIPE.hashCode()));
    assertEquals(expectedUser, updatedUser);
  }
}
