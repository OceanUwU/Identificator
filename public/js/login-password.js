var mode = 1; //will be set to 0 immediately

method = () => ['Login', 'Sign up'][mode];

function switchMode() {
    $('#method').html(method());
    mode = Number(!(Boolean(mode))); //0 -> 1, 1 -> 0
    $('#login').html(method());
    $('#title').html(method());
    $('#with').html(mode ? 'ID' : 'ID (or username, or username#DISCRIM)');

    $('[name="username"]').val(mode ? newID : '');
    $('[name="username"]')[['removeAttr', 'attr'][mode]]('readonly', '');

    $('#error').html('');
}

function submit() {
    $.post('/auth/password/callback', {
        username: $('[name="username"]').val(),
        password: $('[name="password"]').val(),
        method: mode,
    }, success => {
        console.log(success);
        if (success)
            window.location.replace('/confirm-login');
        else
            $('#error').html(mode ? 'That ID has expired. Refresh to get a new one.' : 'Username or password is incorrect.');
    });
}

switchMode();