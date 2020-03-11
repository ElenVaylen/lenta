import $ from 'jquery';
window.$ = window.jQuery = $;
import 'slick-carousel';
import WOW from 'wow.js';
import cities from './json/cities.json';
import spb from './json/spb.json';
import lobl from './json/lobl.json';
import mobl from './json/mobl.json';

let wow = new WOW(
  {
    boxClass:     'wow',      // animated element css class (default is wow)
    animateClass: 'animated', // animation css class (default is animated)
    offset:       0,          // distance to the element when triggering the animation (default is 0)
    mobile:       false,       // trigger animations on mobile devices (default is true)
    live:         true,       // act on asynchronously loaded content (default is true)
    scrollContainer: null,    // optional scroll container selector, otherwise use window,
    resetAnimation: true,     // reset animation on end (default is true)
  }
);
wow.init();

let myMap;
let stores;
let objectManager

const init = (stores) => {
  const currentCity = JSON.parse(localStorage.getItem('lenta_current_city'))
  myMap = new ymaps.Map("map", {
    // Координаты центра карты.
    // Порядок по умолчнию: «широта, долгота».
    // Чтобы не определять координаты центра карты вручную,
    // воспользуйтесь инструментом Определение координат.
    center: [currentCity.lat, currentCity.long],
    // Уровень масштабирования. Допустимые значения:
    // от 0 (весь мир) до 19.
    zoom: 10,
    controls: ["zoomControl"]
  });
  myMap.behaviors.disable("scrollZoom");
  objectManager = new ymaps.ObjectManager({
    // Чтобы метки начали кластеризоваться, выставляем опцию.
    clusterize: false,
    // ObjectManager принимает те же опции, что и кластеризатор.
    gridSize: 32,
    clusterDisableClickZoom: true
  });
  objectManager.objects.options.set({
    iconLayout: "default#image",
    iconImageHref: "./images/marker.png",
    // картинка иконки
    iconImageSize: [55, 63],
    // размеры картинки
    iconImageOffset: [-27, -63] // смещение картинки
  });
  const points = getStores(stores)
  objectManager.add({
    type: "FeatureCollection",
    features: points
  })
  myMap.geoObjects.add(objectManager)
  objectManager.setFilter(filterItems.bind("hypermarket"));
  objectManager.objects.events.add("click", function (e) {
    let objectId = e.get("objectId"); // let point = objectManager.objects.getById(objectId);

    objectManager.objects.balloon.open(objectId);
  });
  $('.map-market__link').click(function(e) {
    e.preventDefault();
    if ($(this).hasClass('map-market__super')) {
      objectManager.setFilter(filterItems.bind("supermarket"))
    } else {
      objectManager.setFilter(filterItems.bind("hypermarket"))
    }
    if (!$(this).hasClass('map-market__active')) {
      $('.map-market__link:not(map-market__active)').removeClass('map-market__active dotted3');
      $(this).addClass('map-market__active dotted3');
    } else {
      return false;
    }
  });
}

const getStores = function getStores(points) {
  return points.map(store => ({
    type: 'Feature',
    id: store.id,
    point: store.name,
    pointType: store.type,
    geometry: {
      type: "Point",
      coordinates: [store.lat, store.long]
    },
    properties: {
      balloonContent: '<div class="balloncontent"><div class="balloncontentcapt cond">' + store.name + "</div></div>"
    }
  }))
}

const filterItems = function filterItems(point) {
  return point.pointType == this;
}

let getCities = async () => {
  const url = 'http://lenta.com/api/v1/cities';
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin':'*'
      },
      credentials: 'same-origin'
    })
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error('Ошибка:', error);
    return cities;
  }
}

async function loadStores(cityId) {
  try {
    const response = await fetch(`http://lenta.com/api/v1/cities/${cityId}/stores`, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
    if (response.ok) {
      return response.json()
    }
  } catch(error) {
    console.error('Ошибка:', error);
    let id = spb;
    switch(cityId) {
      case 'msk':
        id = msk;
      case 'lobl':
        id = lobl;
      case 'mobl':
        id = mobl;
        break;
      default:
    }
    return id;
  }
}
$(document).ready(async function() {
  // В случае, если мы хотим получать города через АПИ
  // const cities = await getCities();
  const currentCity = JSON.parse(localStorage.getItem('lenta_current_city'));
  if (currentCity) {
    stores = await loadStores(currentCity.id)
    let text  = currentCity.name;
    $('.choise-city').text(text);
    ymaps.ready(() => init(stores))
  } else {
    stores = spb;
    $('.body').addClass('map-modal__open');
  }
  let modalCity = $('.map-modal__list');
  let itemsInCol = cities.length % 3;
  let baseItemsCol = cities.length / 3;
  let lastCol = cities.length / 3;
  if (itemsInCol !== 0) {
    lastCol = cities.length - baseItemsCol * 2;
  }
  for (let i = 1; i <= 3; i++) {
    modalCity.append(`<div class='map-modal__col map-modal__col${i}'></div>`);
    let colCityes = cities.slice(baseItemsCol * (i - 1), baseItemsCol * i)
    if (i === 3) {
      colCityes = cities.slice(baseItemsCol * (i - 1), lastCol * i)
    }
  
    colCityes.forEach(item => {
      $(`.map-modal__col${i}`).append(`<div class="map-modal__item">
      <a class="map-modal__link" href="" id="${item.id}" data-lat="${item.lat}" data-long="${item.long}" 
      data-mediumStoreConcentration="${item.mediumStoreConcentration}" 
      data-highStoreConcentration="${item.highStoreConcentration}">
      <span class='map-modal__link-name'>${item.name}</span></a>
      </div>`)});
  }
  let letters = []
  const reservedCities = [
    'spb',
    'msk',
    'lobl',
    'mobl'
  ]
  let letter = (letter) => {
    return (`<span class='map-modal__letter'>${letter}</span>`)
  }
  cities.forEach(city => {
    if (letters.indexOf(city.name[0]) === -1 && reservedCities.indexOf(city.id) === -1) {
      $(`.map-modal__link#${city.id}`).prepend(letter(city.name[0].toUpperCase()))
      letters.push(city.name[0])
    }
  })
  $(`.map-modal__link#spb`).prepend(letter('С'));
  $(`.map-modal__link#msk`).prepend(letter('М'));

  const res = await loadStores('spb');

  $(".map-modal__link").on("click", function (event) {
    event.preventDefault();
    const cityID = event.currentTarget.id;
    const cityData = cities.find(city => city.id === cityID);
    let text = $(this).children('.map-modal__link-name').text();
    myMap && myMap.setCenter([cityData.lat, cityData.long], 10);
    localStorage.setItem('lenta_current_city', JSON.stringify(cityData));
    loadStores(cityID)
        .then(stores => {
          const points = getStores(stores)
          if (myMap) {
            objectManager.add({
              type: "FeatureCollection",
              features: points
            })
            myMap.geoObjects.add(objectManager)
          } else {
            ymaps.ready(() => init(stores))
          }
        })
    $('.body').removeClass('map-modal__open');
    $('.choise-city').text(text);

    localStorage.setItem('lenta_current_city', JSON.stringify(cityData));
  });
  $('.choise-city').click(function(event){
    event.preventDefault();
    $('.body').addClass('map-modal__open');
  });
});
$(document).ready(function() {
  $('.body').removeClass('loading');

  $('.menu-bar__wrap').click(function(){
    if($('.body').hasClass('menu-open')) {
      $('.body').removeClass('menu-open');
      $('.overflow').removeClass('active');
    } else {
      $('.body').addClass('menu-open');
      $('.overflow').addClass('active');
    }
  });

  $(document).click(function (e){
    let div = $('.menu-bar');
		if (!div.is(e.target) && div.has(e.target).length === 0) {
      $('.body.menu-open').removeClass('menu-open');
      $('.overflow.active').removeClass('active');
		}
  });

  $('.knives-slider').slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    variableWidth: true,
    arrows: false,
    cssEase: 'linear',
    asNavFor: '.knives-dotted',
    responsive: [
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 1,
          variableWidth: false,
          centerMode: false,
        }
      }
    ]
  });

  $('.knives-dotted').slick({
    infinite: true,
    slidesToShow: 11,
    slidesToScroll: 1,
    arrows: false,
    cssEase: 'linear',
    asNavFor: '.knives-slider',
    focusOnSelect: true,
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 5
        }
      },
      {
        breakpoint: 567,
        settings: {
          slidesToShow: 3
        }
      }
    ]
  });

  $('.knives-slider__arrows .arrow-left').click(function(){
    $('.knives-slider').slick('slickPrev');
  });
  $('.knives-slider__arrows .arrow-right').click(function(){
    $('.knives-slider').slick('slickNext');
  });

  $('.map-market__hyper').addClass('map-market__active dotted3');

  $(".ancor").on("click", function (event) {
    event.preventDefault();
    let id  = $(this).attr('href');
    let header = $(".header__wrap").height();
    let top = $(id).offset().top - header;
    $('body,html').animate({scrollTop: top}, 1500);
  });
});
