/* Shared site behaviour: mobile menu, year, contact form. */
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('mainNav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var to = form.getAttribute('data-to');
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var msg = form.elements.message.value.trim();
      var subject = encodeURIComponent('Website enquiry from ' + name);
      var body = encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
    });
  }
});
