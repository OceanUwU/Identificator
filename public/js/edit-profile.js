function UPS(input={}) { //update pronoun sentence
    if (input.value)
        input.value = input.value.toLowerCase();
    let subjectPronoun = $('#subjectPronoun').val()
    $('.subjectPronoun').text(subjectPronoun);
    $('.subjectPronounTitleCase').text(`${(subjectPronoun[0] ? subjectPronoun[0] : ' ').toUpperCase()}${subjectPronoun.slice(1)}`);
    $('.objectPronoun').text($('#objectPronoun').val());
    $('.pronounTypeDependent').each((i, e) => $(e).html($(e).attr(`d-${$('#pronounType').val()}`)));
}
UPS();

function UDE() { //update design example
    $('#designExample').css('background-color', $('#cp1').val());
    [2, 3, 4, 'text'].forEach(n => $(`.chevron${n}`).attr('fill', $(`#cp${n}`).val()));
}

$(() => {
    $('#cp1, #cp2, #cp3, #cp4, #cptext').colorpicker({
        format: 'hex'
    });
    UDE();
});

$('#avatar').change(e => {
    if (e.target.files[0].size >= limits.avatar[0]) {
        $(e.target).val(''); //delete the file
        bootbox.alert(`Your avatar's file size must not exceed ${limits.avatar[1]}.`);
    }
});

$('input[availableChars]').keyup(ev => {
    let el = $(ev.target)
    let val = el.val().split('');
    let availableChars = el.attr('availableChars');
    let toRemove = [];
    for (let i in val)
        if (!availableChars.includes(val[i]))
            toRemove.push(i);
    if (toRemove.length > 0) {
        toRemove.reverse();
        for (let i of toRemove)
            val.splice(i, 1);
        bootbox.alert(`You typed an invalid character! ${el.attr('name')} must include only the following characters: ${availableChars}`);
        el.val(val.join(''));
    }
});

for (let i of [
    ['#username', ()=>$('#username').val()],
    ['#usernameD, #discriminator', ()=>`${$('#usernameD').val()}%23${$('#discriminator').val()}`]
]) {
    let el = $(i[0]);
    let checkNum = 0;
    let check = () => {
        let storeCheckNum = Number(++checkNum);
        let toCheck = i[1]();
        el.removeClass('is-valid');
        el.removeClass('is-invalid');
        setTimeout(() => {
            if (storeCheckNum == checkNum)
                $.getJSON(`/api/available?me&n=${toCheck}`, available => {
                    if (storeCheckNum == checkNum) {
                        if (available && toCheck.length > 0) {
                            el.addClass('is-valid');
                        } else {
                            el.addClass('is-invalid');
                        }
                    }
                });
        }, 500);
    };
    el.keyup(check);
    check();
}

$('.count-message').each((i, e) => {
    let update = ev => {
        let inp = $(ev.target);
        $(e).html(`${inp.val().length}${inp.attr('maxlength') ? `/${inp.attr('maxlength')}` : ''}`);
    };
    let input = $(`#${$(e).attr('for')}`);
    input.keyup(update);
    update({target: input[0]});
});