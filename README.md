# Application for Clinic Reception
A Windows desktop application for clinic reception that manages patient records, consultation details, and receipts.

The application allows reception staff to:

- Log in using their reception credentials
- Create new patient records
- Search for existing patients using their MR number
- Automatically populate existing patient information
- Record consultations and consultation fees
- Generate and print payment receipts
- View patient consultation records
- Filter consultation records by consultant and month
- Display the total consultation fees for the selected month
- Print the patient list

## Technologies
The application is built using:

- Electron
- Electron Forge
- HTML
- CSS
- JavaScript
- Bootstrap
- MySQL

The application uses Electron's preload and IPC mechanisms to communicate between the renderer and main processes.

## Requirements
For development you need:

- Node.js
- npm
- MySQL
- XAMPP (if XAMPP is being used to run the local MySQL server)
- Git (optional, for version control)

The application connects to a MySQL database named: eyemed_db

## How to Create a New Electron Application
If a new Electron application needs to be created from scratch in the future, Electron Forge can be used to create the project structure.

- Install Electron Forge globally:
  
  npm install --global electron-forge
  
- Create a new Electron application:
  
  electron-forge init my-electron-app
  
- Move into the new project:
  
  cd my-electron-app
  
- Start the application:
  
  npm start

Electron Forge can then be used to package and distribute the application.

For a new project, the Electron version and other dependencies should be checked and kept reasonably current rather than relying on very old Electron packages.

## Running the Application in Development
- Clone or download the repository
- Open a terminal in the project folder (folder containing src)
- Install dependencies
  npm install
- Download XAMPP and start apache and mysql (If they dont start automatically)
  (Apache is only required if you need to use phpMyAdmin through the XAMPP web interface. The Electron application itself does not require Apache.)
- Start the application
  npm start

(Make sure the required MYSQL database is running. The database can be accessed on localhost/phpmyadmin)

## Packaging the Application
To create a packaged version of the application without creating an installer:
- npm run package
The packaged application will be created in the out directory.

On Windows, the packaged application is generated under a directory similar to:
out\clinicapp-win32-x64

The application can be launched using:
clinicapp.exe

## Creating the Windows Installer
The project uses Electron Forge with the Squirrel Windows maker to create the installer.
- npm run make
  
The installer will be created under:
out\make\squirrel.windows\x64

The installer is a file similar to:
clinicapp-1.0.0 Setup.exe

This is the file that should be provided to the client for installation.

## Installing the Application on the Client Computer
- Download XAMPP
- Open XAMPP in admin mode
- Check the boxes next to apache and mysql (This will start apache and mysql automatically, whenever the system boots.)
  (Apache is only required if you need to use phpMyAdmin through the XAMPP web interface. The Electron application itself does not require Apache.)
- Run the installer on the client computer.
- Once installation is complete, launch the application from Windows.
- Ensure that the required MySQL database is available on the client computer. The database can be accessed on localhost/phpmyadmin

The client's existing database should be preserved when updating the application.

## Updating the Application

When a new version of the application is created:

- Build a new installer using:
- npm run make
- Provide the new Setup.exe to the client.
- Install the new version on the client computer.

The application should be tested before distributing a new version to the client.

## Database
**Database name:** eyemed_db <br>
**Table:** Consultations <br>
<img width="1227" height="247" alt="image" src="https://github.com/user-attachments/assets/ebd165b5-eda6-46ad-81d1-9cae4a8b7053" />
 <br>
**Table:** Patients <br>
<img width="908" height="245" alt="image" src="https://github.com/user-attachments/assets/024b2bb8-8747-4401-bcce-bf2187eb37a1" />
<br>
**Table:** Users <br>
<img width="953" height="142" alt="image" src="https://github.com/user-attachments/assets/e0e0f1c4-a491-4cae-835b-482c80ec95e5" />
 <br>






