# viewgle

A small analytics platform for express and mongo to leverage server side rendering. If you want to add viewgle to your client side application see our plugins:

![](https://i.imgur.com/vyHUPa0.png)

1. Vue: [viewgle-vue](https://www.npmjs.com/package/viewgle-vue)
2. React: Coming soon...

## Usage

In your express app file:

1. Set up your viewgle options like so:

```javascript
let opts: {
  dbConnect: process.env.MONGO_CONNECT_STRING, // this is on you
  skipAssets: true
};
```

2. Tell your express app to use the viewgle router - this will create a catch all for collecting data across all urls in your app, this will also create a `/viewgle` route to view your analytics:

```javascript
// use the viewgle router
app.use(viewgle.router);

// set up viewgle options
app.use(
  viewgle.define({
    opts
  })
);
```

## Available options:

| Option          | Type      | Description                                                  |
| --------------- | --------- | ------------------------------------------------------------ |
| `dbConnect`     | `String`  | The string value for your mongodb database connection        |
| `skipLocalhost` | `Boolean` | Boolean for skipping logging of localhost url or not         |
| `skipAssets`    | `Boolean` | Boolean for skipping logging of assets like `.js` and `.css` |
