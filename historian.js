import { on, off } from 'uc-dom'
const history_ = window.history;
const location_ = window.location;

const rxTrailingSlash = /\/$/;
function getLocationWithHash() {
  let loc = location_.pathname;
  const hash = location_.hash;

  if (hash) {
    loc = loc.replace(rxTrailingSlash, '') + '/' + hash;
  }

  return loc;
}

const Historian = function(cb) {
  this.cb = cb;
  this.url = getLocationWithHash();
  this.prevState = {};

  this.onPopState = on(window, 'popstate', e => {
    const loc = getLocationWithHash();
    if (this.url !== loc) {
      this.url = loc;
      this.cb(this.url, e.state);
    }
  });
};

Historian.prototype = {
  getState: function() {
    return {
      url: this.url,
      state: history_.state
    };
  },

  pushState: function(state, url) {
    if (this.url !== url) {
      this.prevState = this.getState();
      this.url = url;
      history_.pushState(state, null, url);
      this.cb(url, state);
    }
  },

  replaceState: function(state, url) {
    if (this.url !== url) {
      history_.replaceState(state, null, url);
      this.url = url;
    }
  },

  back: function(replace) {
    if (replace) {
      this.replaceState(this.prevState.state, this.prevState.url);
    } else {
      history_.back();
    }
  },

  remove: function() {
    off(window, 'popstate', this.onPopState);
  }
};

export default Historian;
