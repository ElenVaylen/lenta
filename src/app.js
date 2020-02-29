import $ from 'jquery';
window.$ = window.jQuery = $;
import 'slick-carousel';
import AOS from 'aos';
import cities from '../cities.json';
import map from '../map.json';
import axios from 'axios'

// console.log({cities, map})


let getCyties = async () => {
  const url = 'http://localhost:8010/api/v1/cities';
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin':'*'
      },
      credentials: 'same-origin'
    })
    console.log(response);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

async function loadFile(cityId) {
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
  const cities = await getCyties();
  console.log(cities)
  let modalCity = $('.map-modal__list');
  cities.map(item => {
    modalCity.append(`<div class="map-modal__item">
    <a class="map-modal__link" href="" id="${item.id}" data-lat="${item.lat}" data-long="${item.long}" 
    data-mediumStoreConcentration="${item.mediumStoreConcentration}" 
    data-highStoreConcentration="${item.highStoreConcentration}">
    ${item.name}</a>
    </div>`);
  });
  const res = await loadFile('spb')
  console.log(res)
  $(".map-modal__link").on("click", function (event) {
    event.preventDefault();
    let text = $(this).text();
    $('.body').removeClass('map-modal__open');
    $('.choise-city').text(text);
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
  $('.map-market__link').click(function(e) {
    e.preventDefault();
    if (!$(this).hasClass('map-market__active')) {
      $('.map-market__link:not(map-market__active)').removeClass('map-market__active dotted3');
      $(this).addClass('map-market__active dotted3');
    } else {
      return false;
    }
  });

  $(".ancor").on("click", function (event) {
    event.preventDefault();
    let id  = $(this).attr('href');
    let header = $(".header__wrap").height();
    let top = $(id).offset().top - header;
    $('body,html').animate({scrollTop: top}, 1500);
  });
});
