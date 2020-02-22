import $ from 'jquery';
window.$ = window.jQuery = $;
import 'slick-carousel';

$(document).ready(function() {
  $('.knives-slider').slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    variableWidth: true,
    arrows: false,
    cssEase: 'linear',
    asNavFor: '.knives-dotted'
  });
  $('.knives-dotted').slick({
    infinite: true,
    slidesToShow: 9,
    slidesToScroll: 1,
    arrows: false,
    cssEase: 'linear',
    asNavFor: '.knives-slider',
    focusOnSelect: true
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
});