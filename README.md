![](https://github.com/matthevdb/Share-A-Meal-API/actions/workflows/testing-and-deployment.yml/badge.svg)

# Share a Meal API

A RESTful API that enables users to share meals.

## Description

Share a Meal API is a Node.js API that provides a bridge between client devices and a backend MySQL server. Using the API, clients are able to perform CRUD operations on meals that are persisted in the database.

## Installation

To install and run the Node.js server, take the following steps:

1.  Make sure [node](https://nodejs.org/) is installed on your machine.

2.  Setup the MySQL server

    1.  Make sure a MySQL server instance is running on your machine.

    2.  Log in to the server using the CLI.

    3.  Create a database for this project:

        `create database <database name>`

    4.  Setup and fill the database:

        `use <database name>`

        `source database\share-a-meal.sql`

3.  Clone this repository:

    `git clone https://github.com/matthevdb/Share-A-Meal-API.git`

4.  Install the required packages to run the server:

    `npm install`

5.  Run the server:

    `node server`

## Usage

As the API is built according to the RESTful architecture, you can communicate with it through HTTP requests. A list of common endpoints can be found below.

### GET /api/info

This endpoint gives basic information about the system:

```
{
    "status": 200,
    "message": "Server info-endpoint.",
    "data": {
        ...,
        ...,
        ...
    }
}
```

### GET /api/meal

This endpoint gives a list of all meals present in the database:

```
{
    "status": 200,
    "message": "Meals found.",
    "data": [
        {
            "id": 1,
            "name": "Meal",
            "description": "A delicious meal",
            "isActive": true,
            "isVega": false,
            "isVegan": false,
            "isToTakeHome": true,
            "dateTime": "2022-03-22T17:35:00.000Z",
            "maxAmountOfParticipants": 4,
            "price": "12.75",
            "imageUrl": "some-url",
            "allergenes": [
                "gluten",
                "lactose"
            ],
            "cook": {
                ...,
                ...,
                ...
            },
            "participants": []
        },
        {...},
        {...}
    ]
}
```

## Authors and acknowledgment

This project was developed by myself, with help of college material as well as online resources.

## Project status

The project has been developed to meet all the necessary requirements for grading. This means there may be future updates if I decide to experiment with expanding the server's functionalities.
