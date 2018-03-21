# Installation Guide (Windows)
### Install Git
Download and install Git from https://git-scm.com/download/win

### Clone the Repository
`cd` into the directory where you want to store the project.

From your terminal:
```
> git clone https://github.com/OdysseyOnlineClassic/odyssey-2-server.git
...
> cd odyssey-2-server
```

### Install Node.js and Node Package Manager (NPM)
Download and install the recommended version of Node from https://nodejs.org/en/

Verify your Node and NPM installation:
```
> node -v
v8.10.0
> npm -v
5.6.0
```

### Install Dependencies
```
> npm install
```

### Run the Server
```
> npm start
````

# Installation Guide (Mac)
### Install Git
Download and install Git from https://git-scm.com/download/mac

### Clone the Repository
`cd` into the directory where you want to store the project.

From your terminal:
```
$ git clone https://github.com/OdysseyOnlineClassic/odyssey-2-server.git
...
$ cd odyssey-2-server
```

### Install XCode
Apple’s XCode development software is used to build Mac and iOS apps, but it also includes the tools you need to compile software for use on your Mac. XCode is free and you can find it in the [Apple App Store](https://itunes.apple.com/us/app/xcode/id497799835?mt=12).

### Install Homebrew
Homebrew is a package manager for the Mac — it makes installing most open source sofware (like Node) as simple as writing `brew install node`.

From your terminal:
```
$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

### Install Node.js and Node Package Manager (NPM)
Install Node and NPM via Homebrew:
```
$ brew install node
```

Verify your Node and NPM installation:
```
$ node -v
v8.10.0
$ npm -v
5.6.0
```

### Install Dependencies
```
$ npm install
```

### Run the Server
```
$ npm start
````
