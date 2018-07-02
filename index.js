import Historian from './historian';

const makeObject = (arr, names) => arr.reduce((a, b, i) => {
  if (b) {
    a[names[i]] = b;
  }
  return a;
}, {});

const rxOptionalParam = /\((.*?)\)/g;
const rxNamedParam = /(\(\?)?:\w+/g;
const rxSplatParam = /\*\w+/g;
const rxEscapeRegExp = /[-{}\[\]+?.,\\\^$|#\s]/g;

const Router = function(onRoute) {
  this.onRoute = onRoute;
  this.counter = 0;
  this.routes = {};
  this.route = [];
  this.historian = new Historian((url, state) => this.check(url, state));
};

Router.prototype = {
  add: function(name, rx) {
    const names = [];
    rx = rx
      .replace(rxEscapeRegExp, '\\$&')
      .replace(rxOptionalParam, '(?:$1)?')
      .replace(rxNamedParam, (match, optional) => {
        names.push(match.substr(1));
        return optional ? match : '([^/?]+)';
      })
      .replace(rxSplatParam, '([^?]*?)');

    this.routes[name] = new RegExp('^' + rx);
    this.routes[name].names = names;
    return this;
  },

  delete: function(name) {
    delete this.routes[name];
    return this;
  },

  check: function(url, state) {
    const routes = this.routes;
    this.counter++;
    for (const r in routes) {
      const rx = routes[r];
      if (rx.test(url)) {
        const urlOpts = Object.assign(
          makeObject(rx.exec(url).slice(1), rx.names),
          state
        );

        this.route = [ r, urlOpts ];
        this.onRoute(r, urlOpts);
        return;
      }
    }
  },

  start: function() {
    this.check(this.historian.url);
  },

  get: function() {
    return this.historian.getState();
  },

  go: function(url, state) {
    if (url[0] === '!') {
      url = url.substr(1);
      if (this.get().url === url) {
        return this.check(url, { force: true })
      }
    }
    this.historian.pushState(state, url);
  },

  replace: function(url, state) {
    this.historian.replaceState(state, url);
  },

  back: function(path, replace) {
    if (this.counter > 1) {
      this.historian.back(replace);
    } else {
      this.go(path);
    }
  },

  remove: function() {
    this.historian.remove();
  }
};

export default Router;
