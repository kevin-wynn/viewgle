# viewgle
A small analytics platform for express and mongo

## Usage
In your express `app.js` or `index.js` file you need to:
1. `setDatabase()` with your connection string
2. Tell express to use `viewgle` with the `/viewgle` route in place, this will be your admin interface
3. Create a catch all endpoint `*` and `collectAndStoreData()` with the request and next function in express

``` javascript
// set the database with your connection string
viewgle.setDatabase(connectString)

// put the /viewgle route above the catch all so you dont track hits to your own analytics page
app.use('/viewgle', viewgle.router)

// create a catch all for all your routes
app.get('*', (req, res, next) => viewgle.collectAndStoreData(req, next))
```