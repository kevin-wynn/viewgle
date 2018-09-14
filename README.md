# viewgle
A small analytics platform for express and mongo

## Usage
In your express `app.js` or `index.js` file you need to:
1. Tell your express app to use the viewgle router - this will create a catch all for collecting data across all urls in your app, this will also create a `/viewgle` route to view your analytics `TODO: Add option for urls to skip, also add login functionality`
2. Tell viewgle to use your database connection string to connect to your mongodb. Viewgle will create an `analytics` table in your mongodb to store its data

``` javascript
app.use(viewgle.router)
app.use(viewgle.define({
  dbConnect: connectString
}))
```