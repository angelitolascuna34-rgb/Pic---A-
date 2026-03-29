let currentUser = null;
let carouselIndex = 0;

// SCROLL EFFECT FOR NAV
window.onscroll = function() {
    const nav = document.getElementById('mainNav');
    if (window.pageYOffset > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
};

function goToGallery() {
    document.getElementById('trashSection').classList.add('hidden');
    document.getElementById('galleryTitle').scrollIntoView({ behavior: 'smooth' });
}

function moveCarousel(direction) {
    const track = document.getElementById('carouselTrack');
    const slides = document.querySelectorAll('.carousel-slide');
    carouselIndex += direction;
    if (carouselIndex < 0) carouselIndex = slides.length - 1;
    if (carouselIndex >= slides.length) carouselIndex = 0;
    track.style.transform = `translateX(-${carouselIndex * 100}%)`;
}

function showAuth(type) {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    if (type === 'landing') {
        document.getElementById('landingPage').classList.remove('hidden');
    } else {
        document.getElementById('authSection').classList.remove('hidden');
        document.getElementById(type + 'Form').classList.remove('hidden');
    }
}

function register() {
    const u = document.getElementById('regUser').value;
    const p = document.getElementById('regPass').value;
    if(!u || !p) return alert("Fill in all fields");
    localStorage.setItem('user_'+u, p);
    alert("Account created!");
    showAuth('login');
}

function login() {
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;
    if(localStorage.getItem('user_'+u) === p && u !== "") {
        currentUser = u;
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        loadGallery();
    } else { alert("Invalid credentials"); }
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const rotation = (Math.random() * 6 - 3).toFixed(1); 
            const mem = { 
                id: Date.now() + Math.random(), 
                user: currentUser, 
                data: e.target.result, 
                type: file.type, 
                deleted: false,
                rotation: rotation,
                uploadDate: new Date().toLocaleString() 
            };
            let db = JSON.parse(localStorage.getItem('mems') || '[]');
            db.push(mem);
            localStorage.setItem('mems', JSON.stringify(db));
            loadGallery();
        };
        reader.readAsDataURL(file);
    });
}

function openFull(data, type) {
    const viewer = document.getElementById('imgViewer');
    const content = document.getElementById('viewerContent');
    viewer.style.display = 'flex';
    if(type.startsWith('image')) {
        content.innerHTML = `<img src="${data}">`;
    } else {
        content.innerHTML = `<video src="${data}" controls autoplay></video>`;
    }
}

function loadGallery() {
    const db = JSON.parse(localStorage.getItem('mems') || '[]');
    const userMems = db.filter(m => m.user === currentUser);
    const gal = document.getElementById('gallery');
    const tGal = document.getElementById('trashGallery');
    gal.innerHTML = ''; tGal.innerHTML = '';
    let tCount = 0;

    userMems.forEach(m => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.style.setProperty('--rotation', (m.rotation || 0) + 'deg');
        
        const media = m.type.startsWith('image') 
            ? `<img src="${m.data}" onclick="openFull('${m.data}', '${m.type}')">` 
            : `<video src="${m.data}" onclick="openFull('${m.data}', '${m.type}')"></video>`;
        
        if(!m.deleted) {
            card.innerHTML = `${media}<div style="padding-top:10px;"><span class="timestamp">${m.uploadDate}</span><button onclick="updateMem(${m.id}, true)" style="background:#ff4757; color:white; width:100%; border-radius:4px; padding:8px; font-size: 0.8rem; margin-top:10px; border:none; cursor:pointer;">Delete</button></div>`;
            gal.appendChild(card);
        } else {
            tCount++;
            card.innerHTML = `${media}<div style="padding-top:10px;"><span class="timestamp">${m.uploadDate}</span><div style="display: flex; gap: 5px; margin-top:10px;"><button onclick="updateMem(${m.id}, false)" style="background:#2ed573; color:white; flex:1; border-radius:4px; padding:8px; font-size: 0.7rem; border:none; cursor:pointer;">Restore</button><button onclick="permanentlyDelete(${m.id})" style="background:#333; color:white; flex:1; border-radius:4px; padding:8px; font-size: 0.7rem; border:none; cursor:pointer;">Clear</button></div></div>`;
            tGal.appendChild(card);
        }
    });
    document.getElementById('trashCount').innerText = tCount;
}

function updateMem(id, status) {
    let db = JSON.parse(localStorage.getItem('mems'));
    db = db.map(m => m.id === id ? {...m, deleted: status} : m);
    localStorage.setItem('mems', JSON.stringify(db));
    loadGallery();
}

function permanentlyDelete(id) {
    if(confirm("Are you sure?")) {
        let db = JSON.parse(localStorage.getItem('mems'));
        db = db.filter(m => m.id !== id);
        localStorage.setItem('mems', JSON.stringify(db));
        loadGallery();
    }
}

function toggleTrash() { document.getElementById('trashSection').classList.toggle('hidden'); }