# BiteCheck

![BiteCheck Current Logo](logo.png)

## About

BiteCheck is a public health–focused dining transparency platform designed to provide New Yorkers and visitors with reliable access to restaurant inspection data. By integrating directly with official restaurant inspection databases, BiteCheck delivers up-to-date information on health and safety compliance across the city. Our platform empowers users to make informed dining decisions by clearly presenting health inspection results, including documented violations related to food preparation practices, sanitation standards, and workplace hygiene. Through an intuitive and user-friendly interface, diners can easily review a restaurant’s inspection history before choosing where to eat. BiteCheck’s mission is to elevate food safety to the same level of importance as cuisine, price, and location. By increasing transparency and accessibility of public health data, we aim to help reduce the risk of food-borne illness, promote higher standards within the restaurant industry, and foster a safer dining environment for both residents and tourists.

Main features include:

- **Restaurant Inspection Search:** Users can search for restaurants and view inspection-related information connected to public health records.
- **Health and Safety Transparency:** BiteCheck helps present inspection results, violations, grades, risk levels, and safety status in a more user-friendly way.
- **User Accounts and Profiles:** Users can create an account, log in, access signed-in features, and manage profile-related information such as profile details and profile photo support.

## How to Build and Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/LucasCunnane1623/BiteCheck.git
cd BiteCheck
```

### 2. Install Project Dependencies

```bash
npm install
```

This command reads the `package.json` file and installs all dependencies needed for the project. These packages are stored in the `node_modules` folder.

### 3. Start MongoDB

BiteCheck uses MongoDB, so MongoDB should be running before starting the application. If MongoDB is installed locally on macOS through Homebrew, you can start it with:

```bash
brew services start mongodb-community
```

If MongoDB is already running through another setup, you can skip this step.

### 4. Start the Server

```bash
npm start
```
This starts the Express server using the start script in `package.json`. Once the server is running, open the app in a browser at:

```text
http://localhost:3000
```

### Helpful Documentation

- [Node.js Documentation](https://nodejs.org/en/docs)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Express Handlebars Documentation](https://www.npmjs.com/package/express-handlebars)

## Project Dependencies

These are the main npm packages currently used in BiteCheck:

```text
main
├── axios@1.13.6                 # Makes HTTP requests to outside APIs or backend services
├── bcrypt@6.0.0                 # Hashes passwords and compares secure passwords
├── bcryptjs@2.4.3               # JavaScript version of bcrypt for password hashing
├── cors@2.8.6                   # Allows the server to handle cross-origin requests
├── date-fns@4.1.0               # Helps work with and format dates
├── dotenv@16.6.1                # Loads environment variables from a .env file
├── express-handlebars@8.0.3     # Renders Handlebars HTML views
├── express-rate-limit@8.3.2     # Limits repeated requests to help protect the server
├── express-session@1.19.0       # Stores session data for login/authentication
├── express@4.22.1               # Main Express server framework
├── helmet@8.1.0                 # Adds security-related HTTP headers
├── jsonwebtoken@9.0.3           # Creates and verifies JSON Web Tokens
├── mongodb@6.21.0               # Connects the app to MongoDB
├── morgan@1.10.1                # Logs HTTP requests in the terminal
├── nodemon@3.1.14               # Restarts the server automatically during development
└── xss@1.0.15                   # Sanitizes user input to reduce XSS risk
```

## Contributors

This project was created for CS-546 Web Programming.

[Back to Top](#bitecheck)
