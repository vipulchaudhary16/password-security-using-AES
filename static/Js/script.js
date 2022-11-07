const showAbout= () => {
    // Show about page
    document.getElementById('about').classList.remove('d-none');
    document.getElementById('team').classList.add('d-none');
    document.getElementById('about_btn').classList.add('btn-success');
    document.getElementById('team_btn').classList.remove('btn-success');
}

const showTeam= () => {
    // Show team page
    document.getElementById('team').classList.remove('d-none');
    document.getElementById('about').classList.add('d-none');
    document.getElementById('team_btn').classList.add('btn-success');
    document.getElementById('about_btn').classList.remove('btn-success');
}

const hideAll= () => {
    document.getElementById('team').classList.add('d-none');
    document.getElementById('about').classList.add('d-none');
    document.getElementById('team_btn').classList.remove('btn-success');
    document.getElementById('about_btn').classList.remove('btn-success');
}

hideAll();
