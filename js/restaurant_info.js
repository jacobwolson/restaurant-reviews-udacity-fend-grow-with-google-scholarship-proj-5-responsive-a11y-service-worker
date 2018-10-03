let restaurant;
var newMap;
let mapSelected = 0;
let shiftPressed = 0;

/**
* Detect if shift pressed; for global use.
*/
document.addEventListener('keydown', function() {
  if (event.keyCode === 16) {
    shiftPressed = 1;
    this.addEventListener('keyup', function(keyupEvent) {
      if (keyupEvent.keyCode === 16) {
        shiftPressed = 0;
      }
    });
  };
});

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
  initTopOfPageButton();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiamFrZW9sc29uIiwiYSI6ImNqa3NhcnAwYTAyaG4zcW9rajQ0cTVoNnMifQ.uc-2aGCCCtA7s59tCF4shA',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
    setTabIndexMapChildren();
  });
}  
 

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Lookup table for image alt tags for restaurant HTML.
 * Source: mplimentation of lookup table inspired by an unknown Udacity reviewer's feedback on a fellow Udacity scholar's
 * project submission, as reported in the Slack channel #fend_proj_5 in the Grow With Google Nanodgrees workspace in Sept., 2018.
 * Source: https://codepen.io/allison_voshell/pen/GqBPYQ
 */
function altTextLookUp(restaurantName) {
  let altText = '';

  let lookup = {
    'Mission Chinese Food':'A group of diners around a table with a pink tablecloth in a booth-lined room with a high-ceiling and crown molding at Mission Chinese Food.',
    'Emily': 'A pizza Margherita pie on a metal tray, sitting on a wood table top, at the restaurant Emily.',
    'Kang Ho Dong Baekjeong': 'The dining area at Kang Ho Dong Baekjeong, featuring an open floor plan, exposed ductwork and modernist-style wood chairs and wood dining tables that include built-in cooking grills.',
    'Katz\'s Delicatessen': 'A nightime scene of pedestrians passing by the entrance of Katz\'s Delicatessen while diners stand at counters inside, visible through large windows on the corner of a single-story brick building.',
    'Roberta\'s Pizza': 'Diners sitting at tables in Roberta\'s Pizza, in front of a walk-up counter and open kitchen; Christmas lights, coat hooks, a globe lamp and posters adorn the walls.',
    'Superiority Burger': 'Two men walk a small dog past Superiority Burger while inside customers gather in a long, narrow and brightly-lit space. An all-white exterior facade features the restaurant\'s name in fridge-magnet-style-letters.',
    'Hometown BBQ': 'Diners in Hometown BBQ seated on wooden folding chairs at small square tables in a rustic and cavernous space featuring a large, weathered, US flag on the far wall.',
    'The Dutch': 'Exterior of The Dutch restaurant on the groundfloor of a grey brick building; the restaurant\'s name is displayed in modernist-style letters on a blue background above the restaurant\'s awning.',
    'Mu Ramen': 'Diners sit at a glossy wooden table in Mu Ramen, where an open kitchen lines the wall behind them.',
    'Casa Enrique': 'A brightly-lit space at Casa Enrique featuring a brushed-chrome-topped bar, white stools, chairs and tables and sparse, natural decor.'
  };

  altText = lookup[restaurantName];

  return altText;
}


/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = altTextLookUp(restaurant.name); 

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = 'Cuisine: ' + restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.tabIndex = 0;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.tabIndex = 0;
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 *
* Source: use of 'h3' tag here in light of previous appearance of 'h1' and 'h2' on page
* implemented based on feedback from a Udacity reviewier on the first submission of this project.
*/
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  title.tabIndex = 0;
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');

  li.tabIndex = 0;
  li.setAttribute('aria-label', 'Review');

  name.innerHTML = review.name;
  name.tabIndex = 0;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.tabIndex = 0;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.tabIndex = 0;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.tabIndex = 0;
  li.appendChild(comments);
  
  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.innerHTML = 'Details: ' + restaurant.name;
  a.setAttribute('aria-current', 'page');
  a.setAttribute('href', './restaurant.html?id=' + restaurant.id);
  li.appendChild(a);
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


/**
 * Modify nav bar on page scroll.
 * Source: https://codepen.io/lili2311/pen/dJjuL
 * Source: https://www.w3schools.com/howto/howto_js_navbar_shrink_scroll.asp
 */
document.addEventListener('scroll', function() {
  /**
   * Shrink nav on scroll down.
   */
  if (window.pageYOffset > 130) {
    const nav = document.getElementsByTagName('nav').item(0);
    const navContentContainer = document.getElementById('nav-content-container');
    const navLogo = nav.getElementsByTagName('img').item(0);
    const navH1 = document.getElementById('nav-h1');
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    const mapContainer = document.getElementById('map-container');
    nav.classList.add('shrink-nav');
    navContentContainer.classList.add('shrink-nav-content-container');
    navLogo.classList.add('shrink-nav-logo');
    navH1.classList.add('shrink-nav-h1');
    breadcrumbContainer.style.marginTop = '2em';
    mapContainer.style.marginTop = '4.6em';
  }
  /**
   * Return nav to full size.
   */
  if (window.pageYOffset <= 130) {
    const nav = document.getElementsByTagName('nav').item(0);
    const navContentContainer = document.getElementById('nav-content-container');
    const navLogo = nav.getElementsByTagName('img').item(0);
    const navH1 = document.getElementById('nav-h1');
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    const mapContainer = document.getElementById('map-container');
    nav.classList.remove('shrink-nav');
    navContentContainer.classList.remove('shrink-nav-content-container');
    navLogo.classList.remove('shrink-nav-logo');
    navH1.classList.remove('shrink-nav-h1');
    breadcrumbContainer.style.marginTop = '';
    mapContainer.style.marginTop = '';
  }
});

/**
 * Set tabindex of relevant asynchronously loaded element inside map to -1 
 * to remove them from tab order. This also sets things up for roving tab index technique 
 * used for radio-group pattern implemented on map and its interactive child elements, below.
 * 
 * In current JS file, gets called inside initMap().
 */
setTabIndexMapChildren = () => {
  let mapMarkers = document.getElementsByClassName('leaflet-interactive');
  // Source: https://stackoverflow.com/a/222847
  var mapMarkersArray = Array.from(mapMarkers);
  let zoomControls = document.getElementsByClassName('leaflet-control-zoom').item(0).getElementsByTagName('a');
  var zoomControlsArray = Array.from(zoomControls);
  let attributionItems = document.getElementsByClassName('leaflet-control-attribution').item(0).getElementsByTagName('a');
  var attibutionItemsArray = Array.from(attributionItems);
  // Source: https://stackoverflow.com/questions/16738371/merge-two-arrays-together
  let interactiveMapElements = zoomControlsArray.concat(mapMarkersArray, attibutionItemsArray);

  interactiveMapElements.forEach(function(element) {
    element.tabIndex = -1;
  });

}

/** 
 * When focus moves to map, initiative a radio-group pattern for the map and its interactive 
 * child elements. 
 * Source: https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/
 * Source: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets
 * Source: https://www.w3.org/TR/2017/WD-wai-aria-practices-1.1-20170628/#radiobutton
 */
document.getElementById('map').addEventListener('focus', function() {
  const map = document.getElementById('map');
  let mapMarkers = document.getElementsByClassName('leaflet-interactive');
  // Source: https://stackoverflow.com/a/222847
  var mapMarkersArray = Array.from(mapMarkers);
  let zoomControls = document.getElementsByClassName('leaflet-control-zoom').item(0).getElementsByTagName('a');
  var zoomControlsArray = Array.from(zoomControls);
  let attributionItems = document.getElementsByClassName('leaflet-control-attribution').item(0).getElementsByTagName('a');
  var attibutionItemsArray = Array.from(attributionItems);
  // Source: https://stackoverflow.com/questions/16738371/merge-two-arrays-together
  let interactiveMapElements = zoomControlsArray.concat(mapMarkersArray, attibutionItemsArray);
  let mapIsRadio = document.getElementById('map-is-radio');
  
  /** 
   * Visual alert for users indicating map can be accessed as radio-group type feature.
   */
  mapIsRadio.style.display = 'block';
  /** 
   * Display map on top of any other elements -- eg, nav.
   */
  document.getElementById('map-container').style.zIndex = 101;
  /** 
   * Add event listeners to map. 
   */
  map.addEventListener('keydown', function (event) {
    /**
     * On arrow right or arrow down, move focus from map to either the last focused
     * focused child element of map, or, if such does not exist, the first ineractive 
     * child element of map.
     */
    if (event.keyCode === 39 || event.keyCode === 40) {
      if (document.getElementById('last-focused-in-map')) {
        const lastFocusedInMap = document.getElementById('last-focused-in-map');
        lastFocusedInMap.focus(function () {
          document.lastFocusedInMap.setAttribute('id', '');
        });
        lastFocusedInMap.tabIndex = 0;
        mapIsRadio.style.display = 'none';
      } else {  
      interactiveMapElements[0].focus();
      interactiveMapElements[0].tabIndex = 0;
      mapIsRadio.style.display = 'none';
      };
    } else if (event.keyCode === 9) {
      mapIsRadio.style.display = 'none';
    }
    /** 
     * On tab, remove z-index from map, allowing it to dislay beneath nav.
     */
    if (event.keyCode === 9) {
    document.getElementById('map-container').style.zIndex = '';
    }
  });

  /** 
   * Add event listeners to interactive child elements of map to handle
   * keyboard input.
   */
  interactiveMapElements.forEach(function(element) {
    element.addEventListener('keydown', function(event) {
      if (event.keyCode === 39 || event.keyCode === 40) {
        event.preventDefault();
        // Source: https://javascript.info/bubbling-and-capturing
        event.stopImmediatePropagation();
        const indexOfCurrentlyActive = interactiveMapElements.indexOf(this);
        let focusOnNext;
        if (indexOfCurrentlyActive +1 == interactiveMapElements.length) {
          focusOnNext = interactiveMapElements[0];
        } else { 
          focusOnNext = interactiveMapElements[indexOfCurrentlyActive + 1];
        };
        this.tabIndex = -1;
        focusOnNext.focus();
        focusOnNext.tabIndex = 0;
      };
      if (event.keyCode === 37 || event.keyCode === 38) {
        event.preventDefault();
        let indexOfCurrentlyActive = interactiveMapElements.indexOf(this);
        let focusOnNext;  
        if (indexOfCurrentlyActive === 0) {
          focusOnNext = interactiveMapElements[interactiveMapElements.length -1];
        } else { 
          focusOnNext = interactiveMapElements[indexOfCurrentlyActive -1];
        };
        this.tabIndex = -1;
        focusOnNext.focus();
        focusOnNext.tabIndex = 0;
      };
      if (event.keyCode === 9) {
       event.stopPropagation();
        if (shiftPressed) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const previousFocus = document.getElementById('nav-h1').firstElementChild;
          this.setAttribute('id', 'last-focused-in-map');
          this.tabIndex = -1;
          document.getElementById('map-container').style.zIndex = '';
          previousFocus.focus();
          mapIsRadio.style.display = 'none';
        } else {
        event.preventDefault();
        event.stopImmediatePropagation();
        const nextFocus = document.getElementsByTagName('footer').item(0).getElementsByTagName('a').item(0);
        this.setAttribute('id', 'last-focused-in-map');
        this.tabIndex = -1;
        document.getElementById('map-container').style.zIndex = '';
        nextFocus.focus();
        mapIsRadio.style.display = 'none';
        };
      };
    });
  });

  /* 
   * If enter is pressed on map markers, simulate a click event and thus trigger
   * navigation to the details page for the relevant restaurant.
   */
  mapMarkersArray.forEach(function (element) {
    element.addEventListener('keydown', function(event) {
      event.preventDefault();
      if (event.keyCode === 13) {
        event.preventDefault();
        element.click();
      }
    });
  });

});

/*
 * Avoid potential bug when tabbing back from next focusable element after map in any case 
 * where a new map has been loaded based on filter input since the map last received focus: when
 * the map first loads, some of its child elements come with a z-index of zero or greater. Manually
 * moving the focus to the map prevents any child elements from receiving focus on tab in this scenario.
 */
document.getElementsByTagName('footer').item(0).getElementsByTagName('a').item(0).addEventListener('keydown', function(event) {
  this.addEventListener('keydown', function(event) {
    if (event.keyCode === 9) {
      if (shiftPressed) {
      event.preventDefault();
      document.getElementById('map').focus();
      }
    };
  });
});

/**
 * Scroll to top button.
 */
initTopOfPageButton = () => {
  const topOfPageButton = document.getElementById('top-of-page-button');

  // Source: https://www.w3schools.com/howto/howto_js_scroll_to_top.asp
  document.getElementById('top-of-page-button').addEventListener('click', function() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });
};
