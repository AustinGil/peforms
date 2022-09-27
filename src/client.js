const INPUT_TAGS = ['input', 'select', 'textarea'].join(',');

/** @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} input */
function validateInput(input) {
  const inputId = input.id || Math.random().toString(36).slice(2);
  input.id = inputId;
  const errorsId = `${inputId}-errors`;
  let descriptors = input.getAttribute('aria-describedby');
  descriptors = descriptors ? descriptors.split(' ') : [];
  descriptors = descriptors.filter((s) => s !== errorsId);

  const { validity } = input;
  input.setAttribute('aria-invalid', false);
  document.getElementById(errorsId)?.remove();

  if (!validity.valid) {
    input.setAttribute('aria-invalid', true);
    const errors = [];
    const errorContainer = document.createElement('div');
    errorContainer.id = errorsId;
    errorContainer.classList.add('error-container');

    if (validity.valueMissing) {
      errors.push(`Field is required.`);
    }
    if (validity.typeMismatch) {
      errors.push(`Must be of type ${input.getAttribute('type')}.`);
    }
    if (validity.rangeUnderflow) {
      errors.push(`Must be greater than ${input.getAttribute('min')}.`);
    }
    if (validity.rangeOverflow) {
      errors.push(`Must be less than ${input.getAttribute('max')}.`);
    }
    if (validity.tooShort) {
      errors.push(`Must be longer than ${input.getAttribute('min-length')}.`);
    }
    if (validity.tooLong) {
      errors.push(`Must be shorter than ${input.getAttribute('max-length')}.`);
    }
    if (validity.patternMismatch) {
      errors.push(`Does not match pattern (${input.getAttribute('pattern')}).`);
    }

    errorContainer.innerText = errors.join(' ');

    descriptors.push(errorsId);
    input.before(errorContainer);
  }

  if (descriptors.length > 0) {
    input.setAttribute('aria-describedby', descriptors.join(' '));
  }
}

/** @param {Event} event */
function validateInputOnBlur(event) {
  const input = event.currentTarget;
  if (event.type === 'blur') {
    input.dataset.allowvalidation = true;
  }
  if (!input.dataset.allowvalidation) return;
  validateInput(input);
}

/** @type {HTMLInputElement[]} */
const inputs = document.querySelectorAll(INPUT_TAGS);
for (const input of inputs) {
  input.addEventListener('input', validateInputOnBlur);
  input.addEventListener('blur', validateInputOnBlur);
}

/** @param {SubmitEvent} event */
function jsSubmitForm(event) {
  /** @type {HTMLFormElement} */
  const form = event.target;
  const url = new URL(form.action || window.location.href);
  const formData = new FormData(form);
  const searchParameters = new URLSearchParams(formData);
  const options = {
    method: form.method,
  };

  if (options.method.toUpperCase() === 'GET') {
    url.search = searchParameters;
  } else {
    options.body =
      form.enctype === 'multipart/form-data' ? formData : searchParameters;
  }

  event.preventDefault();
  return fetch(url, options);
}

for (const form of document.querySelectorAll('form')) {
  form.noValidate = true;
  form.addEventListener('submit', (event) => {
    if (!form.checkValidity()) {
      for (const input of form.querySelectorAll(INPUT_TAGS)) {
        input.dataset.allowvalidation = true;
        validateInput(input);
      }
      form.querySelector(':invalid:not(fieldset)').focus();
      event.preventDefault();
      return;
    }

    jsSubmitForm(event).then((response) => {
      if (response.status < 400) {
        form.reset();
      }
      console.log(response);
    });
  });
}
