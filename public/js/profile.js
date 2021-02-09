function displayCard() {
    let link = `${window.location.protocol}//${window.location.host}/card/${userID}.png?o=${$('#cardOrientation').val()}&t=${$('#cardTitle').val()}${$('#cardBorder').prop('checked') ? '&b' : ''}${$('#cardBackground').prop('checked') ? '&bg' : ''}${$('#cardText').val() != 'none' ? `&ft=${$('#cardText').val()}` : ''}`;
    $('#cardLink').val(link);
    $('#cardDisplay').attr('src', link)
}
displayCard();



function displayAvatar() {
    let link = `${window.location.protocol}//${window.location.host}/avatar/${userID}.png?size=${$('#avatarSize').val()}${$('#avatarNT').prop('checked') ? '&nt' : ''}`;
    $('#avatarLink').val(link);
    $('#avatarDisplay').attr('src', link)
}
displayAvatar();



function changeFlags(ev) {
    if (ev && ev.target.id != 'flagEverything')
        $('#flagEverything').prop('checked', false);
    let flags = 0;
    $('.flag-checkbox').each((i, e) => {
        e = $(e);
        if (e.prop('checked')) 
            flags += 2 ** Number(e.attr('data-bit'));
    });
    flags = toBaseN(flags, 62);
    $('#flags').val(flags);
    let link = `${window.location.protocol}//${window.location.host}/u/${userID}/json${$('#flagEverything').prop('checked') ? '' : `?f=${flags}`}`;
    $('#JSONlink').val(link);
    $('#preview').attr('src', link)
}
changeFlags();
$('.flag-checkbox').change(changeFlags);

$('#flagEverything').change(() => {
    if ($('#flagEverything').prop('checked')) {
        $('.flag-checkbox').each((i, e) => {
            if (e.id != 'flagEverything')
                $(e).prop('checked', false);
        });
        changeFlags();
    }
});




$('.copy-button').each((i, e) => {
    e = $(e);
    e.click(() => {
        let input = $(`#${e.attr('for')}`);
        navigator.clipboard.writeText(input.val());
        let text = e.attr('data-original-title');
        e.attr('data-original-title', 'Copied!');
        e.tooltip('show');
        e.attr('data-original-title', text);
    });
});