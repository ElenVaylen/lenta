import $ from 'jquery';
window.$ = window.jQuery = $;
import 'slick-carousel';
import AOS from 'aos';
import cities from './json/cities.json';
import defaultMap from './json/map.json'

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
  const url = 'http://localhost:8010/api/v1/cities';
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
  }
}

async function loadStores(cityId) {
    const response = await fetch(`http://localhost:8010/api/v1/cities/${cityId}/stores`, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
    if (response.ok) {
      return response.json()
    }
}
$(document).ready(async function() {
  // В случае, если мы хотим получать города через АПИ
  // const cities = await getCities();
  const currentCity = JSON.parse(localStorage.getItem('lenta_current_city'));
  if (currentCity) {
    stores = await loadStores(currentCity.id)
    let text = currentCity.name;
    $('.choise-city').text(text);
    ymaps.ready(() => init(stores))
  } else {
    stores = defaultMap;
    $('.body').addClass('map-modal__open');
  }
  let modalCity = $('.map-modal__list');
  cities.forEach(item => {
    modalCity.append(`<div class="map-modal__item">
    <a class="map-modal__link" href="" id="${item.id}" data-lat="${item.lat}" data-long="${item.long}" 
    data-mediumStoreConcentration="${item.mediumStoreConcentration}" 
    data-highStoreConcentration="${item.highStoreConcentration}">
    ${item.name}</a>
    </div>`);
  });
  const res = await loadStores('spb');

  $(".map-modal__link").on("click", function (event) {
    event.preventDefault();
    const cityID = event.currentTarget.id;
    const cityData = cities.find(city => city.id === cityID);
    let text = $(this).text();
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

  AOS.init({
    offset: 0,
    duration: 600,
    easing: 'ease-in-sine',
    delay: 0,
    disable: 'mobile',
    once: true
  });

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
