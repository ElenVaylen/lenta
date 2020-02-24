import $ from 'jquery';
window.$ = window.jQuery = $;
import 'slick-carousel';

let getCyties = async () => {
  // const response =await fetch('https://lenta.com/api/v1/cities', {mode: 'cors'}, {headers: {'Content-Type': 'application/json'}});
  // let myJson;
  // if (response.ok) {
  //   myJson = await response.json();
  // }
  // console.log(myJson);
  // console.log(JSON.stringify(myJson));

  const url = 'https://lenta.com/api/v1/cities';
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin':'*'
      },
      mode: 'cors',
      credentials: 'same-origin'
    });
    console.log(response);
    if (response.ok) {
      myJson = await response.json();
      console.log(myJson);
    }
    console.log('Успех:', JSON.stringify(myJson));
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
getCyties();

$(document).ready(function() {
  
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

  $('.choise-city').click(function(){
    $('.body').addClass('map-modal__open');
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
    slidesToShow: 9,
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
