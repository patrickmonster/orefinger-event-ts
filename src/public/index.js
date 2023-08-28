const componensList = component => {
    // document.createElement('edit-lable');
    const out = document.createElement('tr');
    const keys = Object.keys(component);
    out.setAttribute('id', component.component_id);
    out.innerHTML = `<td><input type='checkbox'/></td>`;

    for (const k of keys) {
        const td = document.createElement('td');
        const editLable = document.createElement('edit-lable');
        // if (k.endsWith('_id')) {
        //     editLable.setAttribute('type', 'number');
        // }
        if (k.endsWith('_at')) {
            editLable.setAttribute('type', 'date');
        }
        if (k.endsWith('_yn')) {
            editLable.setAttribute('type', 'checkbox');
            editLable.setAttribute('text', component[k] ? 'Y' : 'N');

            td.appendChild(editLable);
            out.appendChild(td);
            continue;
        }

        editLable.setAttribute('text', component[k]);
        td.appendChild(editLable);
        out.appendChild(td);
    }

    return out;
};

window.addEventListener('load', async function () {
    axios;

    if (localStorage.getItem('jwt')) {
        document.querySelector('#discord_login').style.display = 'none';
        document.querySelector('#main').style.display = 'block';

        const user = JSON.parse(localStorage.getItem('user'));
        document.querySelector('#user_username').innerHTML = user.username;
        document.querySelector('#user_avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        this.window.api = axios.create({
            baseURL: 'http://localhost:3000/api',
            headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
        });
    } else {
        const {
            data: { login },
        } = await axios.get('/auth');

        document.querySelector('#discord_login').style.display = 'block';
        document.querySelector('#main').style.display = 'none';
        document.querySelector('a.login').href = login;
    }

    document.querySelectorAll('.logout').forEach(el => {
        el.addEventListener('click', () => {
            localStorage.removeItem('jwt');
            localStorage.removeItem('user');
            window.location.reload();
        });
    });

    document.getElementById('dsicord_code').onkeydown = e => {
        const code = e.key;
        if (code === 'Enter') {
            const code = document.getElementById('dsicord_code').value;
            axios.post('/auth', { code, redirect_uri: 'http://localhost:3000/callback' }).then(({ data }) => {
                const { jwt, user } = data;
                localStorage.setItem('jwt', jwt);
                localStorage.setItem('user', JSON.stringify(user));

                window.location.reload();
            });
        }
    };

    // 컴포넌트 데이터 로딩
    this.document.querySelectorAll('#admin_list button').forEach(el => {
        const target = el.getAttribute('target');
        const headers = el.addEventListener('click', async () => {
            const i = parseInt(el.getAttribute('idx')) || 0;
            const { data: list } = await this.window.api.get(`/admin/${target}?page=${i}`);

            const targetEle = el.parentElement.querySelector(`#${target}`);
            list.forEach(item => {
                targetEle.appendChild(componensList(item));
            });

            if (list.length === 10) {
                el.setAttribute('idx', i + 1);
            } else {
                el.style.display = 'none';
            }
        });
    });
});
