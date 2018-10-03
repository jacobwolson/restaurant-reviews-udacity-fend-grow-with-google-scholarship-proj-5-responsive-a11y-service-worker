let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []
let mapSelected = 0;
let shiftPressed = 0;

/**
  * Detect if shift pressed; for global use.
  */
// Source: https://stackoverflow.com/a/1828679
document.addEventListener('keydown', function() {
  if (event.keyCode === 16) {
    shiftPressed = 1;
    console.log("shift pressed");
    this.addEventListener('keyup', function(keyupEvent) {
      if (keyupEvent.keyCode === 16) {
        shiftPressed = 0;
        console.log("shift up");
      }
    });
  };
});

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
  fetchNeighborhoods();
  fetchCuisines();
  initTopOfPageButton();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
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
  
  updateRestaurants();
}


/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
    ul.lastElementChild.className = 'restaurant-card';
  });
  addMarkersToMap();
  setTabIndexMapChildren();
}

/**
 * Set tabindex of relevant asynchronously loaded element inside map to -1 
 * to remove them from tab order. This also sets things up for roving tab index technique 
 * used for radio-group pattern implemented on map and its interactive child elements, below.
 * 
 * In current JS file, gets called inside `fillRestaurantsHTML()`.
 */
setTabIndexMapChildren = () => {
  console.log("init setting of map children index");
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
  console.log("map children index set");
  });
}

/**
 * Lookup table for image alt tags.
 * Source: implimentation of lookup table inspired by an unknown Udacity reviewer's feedback on a fellow Udacity scholar's
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
    'Roberta\'s Pizza': 'Diners sitting at tables in Roberta\'s Pizza, in front of a walk-up counter and exposed kitchen; Christmas lights, coat hooks, a globe lamp and posters adorn the walls.',
    'Superiority Burger': 'Two men walk a small dog past Superiority Burger while inside customers gather in long, narrow and brightly-lit space. An all-white exterior facade features the restaurant\'s name in fridge-magnet-style-letters.',
    'Hometown BBQ': 'Diners in Hometown BBQ seated on wooden folding chairs at small square tables in a rustic and cavernous space featuring a large, weathered, US flag on the far wall.',
    'The Dutch': 'Exterior of The Dutch restaurant on the groundfloor of a grey brick building; the restaurant\'s name is displayed in modernist-style letters on a blue background above the restaurant\'s awning.',
    'Mu Ramen': 'Diners sit at a glossy wooden table in Mu Ramen, where an open kitchen lines the wall behind them.',
    'Casa Enrique': 'A brightly-lit space at Casa Enrique featuring a brushed-chrome-topped bar, white stools, chairs and tables and sparse, natural decor.'
  };

  altText = lookup[restaurantName];

  return altText;
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.tabIndex = 0;
  li.setAttribute('aria-label', restaurant.name);

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = altTextLookUp(restaurant.name);
  image.tabIndex = 0;
  li.append(image);
  
  /**
   * Source: use of 'h3' tag here in light of previous appearance of 'h1' and 'h2' on page
   * implemented based on feedback from a Udacity reviewier on the first submission of this project.
   */
  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.tabIndex = 0;
  neighborhood.setAttribute('aria-label', 'Neighborhood:' + restaurant.neighborhood)
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.tabIndex = 0;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML =  'Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

} 

/**
 * Modify nav bar on page scroll.
 */
// Source: https://codepen.io/lili2311/pen/dJjuL
// Source: https://www.w3schools.com/howto/howto_js_navbar_shrink_scroll.asp
document.addEventListener('scroll', function() {
  /**
   * Shrink nav on scroll down.
   */
  if (window.pageYOffset > 200) {
    const nav = document.getElementsByTagName('nav').item(0);
    const navContentContainer = document.getElementById('nav-content-container');
    const navLogo = nav.getElementsByTagName('img').item(0);
    const navH1 = document.getElementById('nav-h1');
    nav.classList.add('shrink-nav');
    navContentContainer.classList.add('shrink-nav-content-container');
    navLogo.classList.add('shrink-nav-logo');
    navH1.classList.add('shrink-nav-h1');
  };
  /**
   * Return nav to full size.
   */
  if (window.pageYOffset <= 200) {
    const nav = document.getElementsByTagName('nav').item(0);
    const navContentContainer = document.getElementById('nav-content-container');
    const navLogo = nav.getElementsByTagName('img').item(0);
    const navH1 = document.getElementById('nav-h1');
    nav.classList.remove('shrink-nav');
    navContentContainer.classList.remove('shrink-nav-content-container');
    navLogo.classList.remove('shrink-nav-logo');
    navH1.classList.remove('shrink-nav-h1');
  };

})

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
  let mapIsRadio = document.getElementById('map-is-radio');

  // Source: https://stackoverflow.com/questions/16738371/merge-two-arrays-together
  let interactiveMapElements = zoomControlsArray.concat(mapMarkersArray, attibutionItemsArray);
  
  /** 
   * Visual alert for users indicating map can be accessed as radio-group type feature.
   */
  mapIsRadio.style.display = 'block';
  /** 
   * Display map on top of any other elements -- eg, nav.
   */
  document.getElementById('map-container').style.zIndex = 101;
  /** Get setup for roving tab index on interactive child elements of map
   * by ensuring all have a tab index of -1.
   */
 
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
        function removeID() {
          lastFocusedInMap.setAttribute('id', '');
        };
        lastFocusedInMap.focus();
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
          const previousFocus = document.getElementById('nav-content-container').getElementsByTagName('a').item(0);
          this.setAttribute('id', 'last-focused-in-map');
          this.tabIndex = -1;
          document.getElementById('map-container').style.zIndex = '';
          previousFocus.focus();
          mapIsRadio.style.display = 'none';
        } else {
        event.preventDefault();
        event.stopImmediatePropagation();
        const nextFocus = document.getElementById('neighborhoods-select');
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
document.getElementById("neighborhoods-select").addEventListener('keydown', function(event) {
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
