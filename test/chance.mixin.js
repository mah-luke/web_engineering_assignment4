module.exports = {
  nn: function (fn, n1, n2, opts = {}) {
    return this.unique(fn, this.integer({ min: n1, max: n2 }), opts)
  },
  artworkTitle: function () {
    return this.sentence({ words: this.integer({ min: 1, max: 10 }), punctuation: false })
  },
  artistName: function () {
    return this.name({ middle: this.bool() })
  },
  artworkDate: function () {
    return this.year({ min: 1400, max: 2020 }).toString()
  },
  searchQuery: function () {
    return this.animal().toLowerCase();
  },
  printSize: function () {
    return this.pickone(['S', 'M', 'L']);
  },
  matColor: function () {
    return this.pickone(['arctic', 'ivory', 'mint', 'indigo', 'mauve']);
  },
  frameStyle: function () {
    return this.pickone(['classic', 'natural', 'shabby', 'elegant']);
  },
  frameWidth: function () {
    return this.integer({ min: 20, max: 50 });
  },
  matWidth: function () {
    return this.integer({ min: 0, max: 10 });
  },
  artworkId: function () {
    return this.integer({ min: 1, max: 1000000 });
  },
  imageUrl: function ({ baseUrl = 'https://images.example.com/', extension = 'jpg' } = {}) {
    return baseUrl + this.string({ length: 6, casing: 'upper', alpha: true, numeric: true }) + '.' + extension;
  },
  artwork: function ({ artworkId = null } = {}) {
    return {
      artworkId: artworkId ?? this.artworkId(),
      title: this.artworkTitle(),
      artist: this.artistName(),
      date: this.artworkDate(),
      image: this.imageUrl()
    }
  },
  cartItemId: function () {
    return this.integer({ min: 1, max: 100 });
  },
  cartItem: function ({ cartItemId = null, artworkId = null } = {}) {
    let item = {
      cartItemId: cartItemId ?? this.cartItemId(),
      price: this.integer({ min: 3000, max: 25500 }),
      artworkId: artworkId ?? this.artworkId(),
      printSize: this.printSize(),
      frameStyle: this.frameStyle(),
      frameWidth: this.frameWidth(),
      matWidth: this.matWidth()
    };
    if (item.matWidth > 0) {
      item.matColor = this.matColor();
    }
    return item;
  },
  cart: function ({ min = 3, max = 5 } = {}) {
    const cartItemIds = this.nn(this.cartItemId, min, max);
    return cartItemIds.map(cartItemId => this.cartItem({ cartItemId }));
  },
  shippingDestination: function () {
    const country = this.pick(this.countries());
    return {
      country: country.abbreviation,
      displayName: country.name,
      cost: this.integer({ min: 100, max: 10000 })
    }
  },
  frame: function () {
    const style = this.word({ syllables: 2 });
    return {
      style: style,
      label: this.capitalize(style),
      slice: this.integer({ min: 10, max: 300 }),
      cost: this.integer({ min: 50, max: 200 }),
      thumbImage: this.imageUrl({ extension: 'png' }),
      borderImage: this.imageUrl()
    }
  },
  mat: function () {
    const color = this.word();
    return {
      color: color,
      label: this.capitalize(color),
      hex: this.color({ format: 'hex' })
    }
  },
  customer: function () {
    return {
      email: this.email({ domain: 'example.com' }),
      shipping_address: this.shippingAddress()
    }
  },
  shippingAddress: function () {
    let address = {
      name: this.name(),
      address: this.address(),
      city: this.city(),
      country: this.country(),
      postal_code: this.postcode()
    };
    if (this.bool()) {
      address.phone = this.phone();
    }
    return address;
  },
  creditCard: function () {
    return {
      cardholder: this.name(),
      cardnumber: this.cc(),
      exp_month: parseInt(this.exp_month()),
      exp_year: parseInt(this.exp_year()),
      cvc: this.integer({ min: 1, max: 999 })
    }
  },
  nanoid: function () {
    return this.string({ pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-', length: 21 });
  },
  blingPaymentIntentId: function () {
    return 'pi_' + this.nanoid();
  },
  blingClientSecret: function () {
    return 'cs_' + this.nanoid();
  },
  blingEventId: function () {
    return 'ev_' + this.nanoid();
  }
};