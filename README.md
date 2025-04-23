# InfoVis Project 2025: Water Quality Dashboard

This project provides water quality analytics for various locations within the Big Sioux River Watershed. The data includes key parameters such as pH levels, dissolved oxygen, turbidity, and the presence of pollutants. Visual design techniques assess water health and quality in order to inform decisions in the efforts of conservation, environmental health, and human health challenges.

# To Run The Project

The project consists of two components: Frontend and Backend, that need to be built and executed for the project to successfully run.

## Backend Construction

to setup the backend, navigate to the backend folder of the project directory using `cd ../../backend`
> Note: Ensure you have python and pip installed in order to run the dependencies

Once you've navigated to the directory download the python dependencies necessary to execute the backend. Use the command:
`pip install -r requirements.txt` to download the required dependencies

> Alternatively, if pip fails to install the required dependencies use the following codeblock to download the dependencies:

<code>pip install flask==2.0.1
pip install flask-cors==3.0.10
pip install pandas==1.5.3
pip install numpy==1.23.5
pip install matplotlib==3.6.3
pip install seaborn==0.11.2
pip install plotly==5.3.1</code>

After downloading the required libraries, use the command in the backend directory: `python app.py` to start the backend. Ensure the backend successfully executes!

## Frontend Construction

to setup the frontend, navigate to the project directory: `../../InfoVis2025`. Or out of the backend folder using `cd ../`. After, entering the project ensure the following dependencies are installed:
[Node.js](https://nodejs.org/en)
> Note: You can check that Node.js and NPM are installed using `npm -v` and `node -v`

Project dependencies are installed using `npm install` in the project directory

Once you've installed the project dependencies, start the project using the command `npm start` to run the project (and `python app.py` for the project) to view the entire project.

## Additional Frontend Startup Shorthand Listed Below

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
