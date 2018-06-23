# Unchained UI

## Router

Declarative router

### Usage

```js
import Router from 'uc-router'

const router = new Router((name, params) =>
  console.log(name, params)
)

router
  .add('post', '/posts(/:id)')
  .add('index', '/');

router.start();

```

### Methods

#### add(name, route)

Adds new route with the `name`.


#### delete(name)

Deletes a route with the `name`.

#### start()

Starts the router and checks the current URL

#### go(url[, state])

Navigates to `url`. If `url` is the same as current does nothing. However, if you add `!` symbol to the beginning of the `url` forces the router to it check again.

#### replace(url[, state])

Replaces the current state with `url` and `state`.

#### back([path])

Goes back in history if previous state exists. Else navigates to the `path`.

#### remove()

Removes the router

License MIT

© velocityzen

