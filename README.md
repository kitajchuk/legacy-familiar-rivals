## Legacy Codebase
This is an old web app that was built using v3 of Middleman App and Grunt (yikes). I can't even run the source on my machine so I'm just archiving it for posterity and the static `build` can be deployed for reference. What follows is the original `README`.

familiar-rivals
===============

> Issue 5 of Familiar


## Installation
This project uses [middleman](http://middlemanapp.com) for the development cycle. It also uses [funpack](https://github.com/Instrument/funpack) for a number of javascript resources.

- Install [middleman](http://middlemanapp.com) if you have not already.
- Install [funpack](https://github.com/Instrument/funpack) if you have not already.


## Getting Started
```shell
# Clone repository
git clone git@github.com:Instrument/familiar-rivals.git

# Change directories
cd familiar-rivals

# Install dependencies
npm install

# Start the development server
bundle exec middleman server
```

You should now be able to access the site locally, [here](http://localhost:4567).


## Grunt
From the `root` directory you can run grunt to manage the javascript for development.
```shell
# Watch with grunt-nautilus
# Uses the `nautilus-watch` task
grunt watch

# Build with grunt-nautilus
grunt
grunt nautilus:build

# Generate js modules with grunt-nautilus
grunt nautilus:module --path "path/to/module"
```


### Grunt Nautilus
This project is using [grunt-nautilus](http://github.com/kitajchuk/grunt-nautilus) for management of the frontend application. You can view documentation [here](https://github.com/kitajchuk/grunt-nautilus/). The javascript for this is located at `/source/javascripts/app/`. If you're going to be diving into the frontend application for the first time it is recommended that you read the grunt-nautilus documentation and familiarize yourself with the organization of the javascript within the app directory.


## Building
You can generate a static build of the project for delivery by running the following. There is a script that can `rsync` to [sandbox.weareinstrument.com/rivals](http://sandbox.weareinstrument.com/rivals/).
```shell
# Build for sandbox
grunt
bundle exec middleman build
./scripts/deploy

# Build for shopify
grunt nautilus:deploy
bundle exec middleman build
grunt shopify-write --dry-run
```

Once the theme is parsed for shopify deployment, you can use the [shopify desktop theme editor](https://apps.shopify.com/desktop-theme-editor) to deploy to [itsfamiliar.com](http://itsfamiliar.com). Just copy all files in the templates dir from test into the actual them templates dir and do the same for assets with the app running. It will upload your changed files to shopify.