// app.js - State Management and UI Interactions for Pharmacy Health and Spa (KKU)

// --- Application State (Demo: Mock Data only, no API) ---
let bookings = [];
const THERAPIST_NAMES = {
    'Random': 'พนักงานใดก็ได้ (สุ่มคิวว่าง)',
    'tu':    'น.ส.วิชุดา รังกา (ตู่)',
    'ning':  'น.ส.อมรรัตน์ ธนภูมิชัย (หนิง)',
    'moo':   'นายอำนาจ คมขำ (หมู)',
    'liu':   'นางอุดมศรี จันทจร (หลิว)',
    'jiab':  'น.ส.นฤมล ทองหล่อ (เจี๊ยบ)',
    'on':    'น.ส.รัสมี รสหานาม (อ้อน)',
    'yu':    'น.ส.ยุพาพร พุ้ยมอม (ยุ)',
    'oi':    'นางสุมาลี พุฒซ้อน (อ้อย)',
    'jim':   'น.ส.ปาริยา โคตะมูล (จิ๋ม)',
    'tim':   'นางพรพิมล ขวดคำ (ติ๋ม)',
    'pong':  'น.ส.ฐาปณีย์ อุตรนคร (ผ่อง)',
    'dao':   'น.ส.ปุญญิสา พิมที (ดาว)',
    'roj':   'น.ส.รจนา จันปัญญา (รจ)',
    'maem':  'น.ส.ปภัสสร กลางเหลือง (แหม่ม)'
};
const SERVICE_NAMES = {
    'Thai Massage': 'นวดแผนไทยเพื่อสุขภาพและแก้อาการ',
    'Herbal Massage': 'นวดประคบสมุนไพรสด',
    'Foot Massage': 'นวดฝ่าเท้ากระตุ้นจุดสะท้อน'
};

// Initial Mock Data
const MOCK_BOOKINGS = [
    {
        id: 'B-1001', queueNo: 'A01', name: 'สมชาย รักดี', phone: '0812345678',
        service: 'Thai Massage', duration: 90, therapist: 'tu',
        date: new Date().toISOString().split('T')[0], time: '09:00 - 10:30',
        benefit: 'Government', price: 100,
        note: 'ใช้สิทธิ์จ่ายตรงข้าราชการ เน้นบ่าไหล่', status: 'completed',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    {
        id: 'B-1002', queueNo: 'A02', name: 'วิภาวี สวยงาม', phone: '0898765432',
        service: 'Herbal Massage', duration: 90, therapist: 'ning',
        date: new Date().toISOString().split('T')[0], time: '10:40 - 12:10',
        benefit: 'General', price: 450,
        note: '', status: 'serving',
        createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString()
    },
    {
        id: 'B-1003', queueNo: 'A03', name: 'ณรงค์ เดชะ', phone: '0855551234',
        service: 'Thai Massage', duration: 90, therapist: 'jiab',
        date: new Date().toISOString().split('T')[0], time: '10:40 - 12:10',
        benefit: 'General', price: 350,
        note: '', status: 'serving',
        createdAt: new Date(Date.now() - 0.7 * 3600000).toISOString()
    },
    {
        id: 'B-1004', queueNo: 'A04', name: 'สิรินทร์ แก้วดี', phone: '0822446688',
        service: 'Thai Massage', duration: 90, therapist: 'moo',
        date: new Date().toISOString().split('T')[0], time: '13:10 - 14:40',
        benefit: 'General', price: 350,
        note: '', status: 'waiting',
        createdAt: new Date(Date.now() - 0.5 * 3600000).toISOString()
    },
    {
        id: 'B-1005', queueNo: 'A05', name: 'อภิชาต พลอยดี', phone: '0877998811',
        service: 'Thai Massage', duration: 90, therapist: 'on',
        date: new Date().toISOString().split('T')[0], time: '14:50 - 16:20',
        benefit: 'General', price: 350,
        note: '', status: 'waiting',
        createdAt: new Date(Date.now() - 0.3 * 3600000).toISOString()
    },
    {
        id: 'B-1006', queueNo: 'A06', name: 'รวีวรรณ ทองคำ', phone: '0866554433',
        service: 'Thai Massage', duration: 90, therapist: 'dao',
        date: new Date().toISOString().split('T')[0], time: '16:30 - 18:00',
        benefit: 'General', price: 350,
        note: '', status: 'waiting',
        createdAt: new Date(Date.now() - 0.1 * 3600000).toISOString()
    }
];

// --- Booking Calendar State ---
let bookCalYear  = new Date().getFullYear();
let bookCalMonth = new Date().getMonth();
let selectedBookDate = '';
let selectedBookSlot  = '';

// --- Initializer & Setup ---
document.addEventListener('DOMContentLoaded', () => {
    loadBookings();
    onServiceOrBenefitChange();
    lucide.createIcons();
    updateAdminClock();
    setInterval(updateAdminClock, 1000);
    updateUI();
    navigateTo('booking');
});

// ── Booking Step 1: Calendar ──────────────────────────────────────────────
function changeBookMonth(delta) {
    bookCalMonth += delta;
    if (bookCalMonth < 0)  { bookCalMonth = 11; bookCalYear--; }
    if (bookCalMonth > 11) { bookCalMonth = 0;  bookCalYear++; }
    renderBookingCalendar();
}

function renderBookingCalendar() {
    const grid  = document.getElementById('book-cal-grid');
    const label = document.getElementById('book-cal-month-label');
    if (!grid) return;

    const thMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                      'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    label.textContent = `${thMonths[bookCalMonth]} ${bookCalYear + 543}`;

    const firstDay  = new Date(bookCalYear, bookCalMonth, 1).getDay();
    const daysInMon = new Date(bookCalYear, bookCalMonth + 1, 0).getDate();
    const today     = new Date().toISOString().split('T')[0];

    grid.innerHTML = '';
    ['อา','จ','อ','พ','พฤ','ศ','ส'].forEach(d => {
        const h = document.createElement('div');
        h.className = 'mcal-dow';
        h.textContent = d;
        grid.appendChild(h);
    });
    for (let i = 0; i < firstDay; i++) {
        grid.appendChild(Object.assign(document.createElement('div'), { className: 'mcal-cell mcal-empty' }));
    }
    for (let day = 1; day <= daysInMon; day++) {
        const dateStr  = `${bookCalYear}-${String(bookCalMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const isPast   = dateStr < today;
        const isToday  = dateStr === today;
        const dayCount = bookings.filter(b => b.date === dateStr).length;

        const cell = document.createElement('div');
        cell.className = `mcal-cell${isToday ? ' mcal-today' : ''}${isPast ? ' mcal-past' : ''}${dayCount ? ' mcal-has-booking' : ''}`;
        if (!isPast) cell.onclick = () => selectBookDate(dateStr, day);

        const num = document.createElement('span');
        num.className = 'mcal-day-num';
        num.textContent = day;
        cell.appendChild(num);
        if (dayCount) {
            const dot = document.createElement('span');
            dot.className = 'mcal-dot';
            dot.textContent = dayCount + ' คิว';
            cell.appendChild(dot);
        }
        grid.appendChild(cell);
    }
}

function selectBookDate(dateStr, day) {
    selectedBookDate = dateStr;
    const thDays = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
    const thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    const d = new Date(dateStr + 'T00:00:00');
    const label = `วัน${thDays[d.getDay()]}ที่ ${day} ${thMonths[d.getMonth()]} ${d.getFullYear()+543}`;
    document.getElementById('day-table-date-label').textContent = label;
    renderSlotPicker(dateStr);
    const dayTable = document.getElementById('booking-day-table');
    if (dayTable) {
        dayTable.classList.remove('hidden');
        setTimeout(() => dayTable.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
}

// ── Booking Step 2: Therapist × Slot Table ───────────────────────────────
function renderSlotPicker(dateStr) {
    const table = document.getElementById('slot-table');
    if (!table) return;

    // Nickname map for compact display
    const NICK = {
        tu:'ตู่', ning:'หนิง', moo:'หมู', liu:'หลิว', jiab:'เจี๊ยบ',
        on:'อ้อน', yu:'ยุ', oi:'อ้อย', jim:'จิ๋ม', tim:'ติ๋ม',
        pong:'ผ่อง', dao:'ดาว', roj:'รจ', maem:'แหม่ม'
    };

    // Build header row: first cell = "รอบ / หมอ", then 14 therapist nicknames
    const thead = table.querySelector('thead');
    thead.innerHTML = '';
    const headRow = document.createElement('tr');
    const thTime = document.createElement('th');
    thTime.className = 'slot-th slot-th-time';
    thTime.textContent = 'รอบ / หมอ';
    headRow.appendChild(thTime);
    THERAPIST_KEYS.forEach(key => {
        const th = document.createElement('th');
        th.className = 'slot-th';
        th.textContent = NICK[key] || key;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);

    // Build body rows: one per time slot
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    TIME_SLOTS.forEach((slot, i) => {
        const tr = document.createElement('tr');

        // Row header: slot label + time
        const tdLabel = document.createElement('td');
        tdLabel.className = 'slot-td-label';
        tdLabel.innerHTML = `<span class="slot-round-badge">รอบ ${i+1}</span><br><span class="slot-time-txt">${slot.time}</span>`;
        tr.appendChild(tdLabel);

        // One cell per therapist
        THERAPIST_KEYS.forEach(key => {
            const existing = bookings.find(b => b.date === dateStr && b.time === slot.time && b.therapist === key);
            const td = document.createElement('td');
            if (existing) {
                td.className = 'slot-td-booked';
                // Show short name (first name only)
                const shortName = existing.name.split(' ')[0];
                td.textContent = shortName;
                td.title = existing.name;
            } else {
                td.className = 'slot-td-avail';
                td.textContent = 'ว่าง';
                td.onclick = () => selectSlotAndTherapist(slot.time, key, slot.label);
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function selectSlotAndTherapist(slotTime, therapistKey, slotLabel) {
    selectedBookSlot = slotTime;
    document.getElementById('book-date').value = selectedBookDate;
    document.getElementById('book-time').value = slotTime;

    // Pre-select therapist in step 3 form
    const therapistSelect = document.getElementById('book-therapist');
    if (therapistSelect) therapistSelect.value = therapistKey;

    const thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    const d = new Date(selectedBookDate + 'T00:00:00');
    const dateLabel = `${d.getDate()} ${thMonths[d.getMonth()]} ${d.getFullYear()+543}`;
    const NICK = {
        tu:'ตู่', ning:'หนิง', moo:'หมู', liu:'หลิว', jiab:'เจี๊ยบ',
        on:'อ้อน', yu:'ยุ', oi:'อ้อย', jim:'จิ๋ม', tim:'ติ๋ม',
        pong:'ผ่อง', dao:'ดาว', roj:'รจ', maem:'แหม่ม'
    };
    document.getElementById('step3-summary-label').textContent =
        `📅 ${dateLabel}  ⏰ ${slotTime} น.  👤 ${NICK[therapistKey] || therapistKey}`;

    onServiceOrBenefitChange();
    setBookStep(2);
}

// ── Step Navigation ────────────────────────────────────────────────────────
function setBookStep(n) {
    [1, 2].forEach(i => {
        document.getElementById(`booking-step-${i}`)?.classList.toggle('hidden', i !== n);
        const stepEl = document.getElementById(`bstep-${i}`);
        if (stepEl) {
            stepEl.classList.toggle('active', i === n);
            stepEl.classList.toggle('done', i < n);
        }
    });
    document.querySelector('.booking-steps')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function backToStep1() {
    setBookStep(1);
    // Re-show day table if date was already selected
    if (selectedBookDate) {
        document.getElementById('booking-day-table')?.classList.remove('hidden');
    }
}

// Load bookings from Mock Data (Demo mode — no API)
function loadBookings() {
    if (bookings.length === 0) {
        bookings = [...MOCK_BOOKINGS];
    }
}

// --- Navigation / Routing ---
function navigateTo(target, event) {
    if (event) {
        event.preventDefault();
    }
    
    // Close mobile menu if open
    document.getElementById('nav-menu').classList.remove('open');
    document.getElementById('menu-icon').setAttribute('data-lucide', 'menu');
    lucide.createIcons();

    // 1. Manage Active Section
    const sections = document.querySelectorAll('.spa-section');
    sections.forEach(sec => {
        sec.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`sect-${target}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // 2. Manage Active Link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.getElementById(`nav-${target}`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Custom updates per screen
    if (target === 'booking') {
        bookCalYear  = new Date().getFullYear();
        bookCalMonth = new Date().getMonth();
        selectedBookDate = '';
        selectedBookSlot = '';
        document.getElementById('booking-day-table')?.classList.add('hidden');
        setBookStep(1);
        renderBookingCalendar();
    } else if (target === 'admin') {
        renderAdminConsole();
        renderTherapistDashboard();
        renderQuotaSection();
    }
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const menuIcon = document.getElementById('menu-icon');
    const isOpen = navMenu.classList.toggle('open');
    
    if (isOpen) {
        menuIcon.setAttribute('data-lucide', 'x');
    } else {
        menuIcon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
}

// --- Form & Price Management Dynamically ---
function onServiceOrBenefitChange() {
    const serviceSelect = document.getElementById('book-service');
    const govContainer = document.getElementById('gov-benefit-option-container');
    const benefitRadios = document.getElementsByName('book-benefit');
    const priceEl = document.getElementById('estimated-price');
    
    if (!serviceSelect || !priceEl) return;
    
    const service = serviceSelect.value;
    
    // Show/hide government benefit option based on service (only for Thai Massage)
    if (service === 'Thai Massage') {
        if (govContainer) govContainer.style.display = 'inline-flex';
    } else {
        if (govContainer) govContainer.style.display = 'none';
        // Reset to General if it was set to Government
        for (let radio of benefitRadios) {
            if (radio.value === 'General') {
                radio.checked = true;
            }
        }
    }
    
    // Find checked benefit
    let selectedBenefit = 'General';
    for (let radio of benefitRadios) {
        if (radio.checked) {
            selectedBenefit = radio.value;
        }
    }
    
    // Calculate price
    let price = 350;
    if (service === 'Thai Massage') {
        price = selectedBenefit === 'Government' ? 100 : 350;
    } else if (service === 'Herbal Massage') {
        price = 450;
    } else if (service === 'Foot Massage') {
        price = 350;
    }
    
    priceEl.textContent = `฿${price}`;
}

function selectServiceAndBook(serviceName) {
    navigateTo('booking');
    setBookStep(1);
    // pre-select service after form is visible
    setTimeout(() => {
        const serviceSelect = document.getElementById('book-service');
        if (serviceSelect) { serviceSelect.value = serviceName; onServiceOrBenefitChange(); }
    }, 50);
}

// --- Booking Submission Handler ---
function handleBookingSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('book-name').value.trim();
    const phone = document.getElementById('book-phone').value.trim().replace(/[^0-9]/g, '');
    const service = document.getElementById('book-service').value;
    const duration = 90; // All services are fixed to 90 minutes / rounds
    const therapist = document.getElementById('book-therapist').value;
    const date = document.getElementById('book-date').value  || selectedBookDate;
    const time = document.getElementById('book-time').value  || selectedBookSlot;
    const note = document.getElementById('book-note').value.trim();
    
    // Get checked benefit
    const benefitRadios = document.getElementsByName('book-benefit');
    let benefit = 'General';
    for (let radio of benefitRadios) {
        if (radio.checked) {
            benefit = radio.value;
        }
    }
    
    // Calculate price
    let price = 350;
    if (service === 'Thai Massage') {
        price = benefit === 'Government' ? 100 : 350;
    } else if (service === 'Herbal Massage') {
        price = 450;
    } else if (service === 'Foot Massage') {
        price = 350;
    }
    
    if (!name || !phone || !service || !date || !time) {
        showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'warning');
        return;
    }
    
    // Generate next Queue Number (e.g. A01, A02...)
    const maxNum = bookings.reduce((max, booking) => {
        const numStr = booking.queueNo.substring(1);
        const num = parseInt(numStr, 10);
        return num > max ? num : max;
    }, 0);
    
    const nextNum = maxNum + 1;
    const queueNo = 'A' + String(nextNum).padStart(2, '0');
    const newId = 'B-' + (1000 + nextNum);

    const newBooking = {
        id: newId,
        queueNo: queueNo,
        name: name,
        phone: phone,
        service: service,
        duration: duration,
        therapist: therapist,
        date: date,
        time: time,
        benefit: benefit,
        price: price,
        note: note,
        status: 'waiting',
        createdAt: new Date().toISOString()
    };
    
    // Save in memory (Demo mode)
    bookings.push(newBooking);

    // Update general UIs
    updateUI();

    // Display Success modal (Receipt)
    openSuccessModal(newBooking);
    
    // Reset form and go back to step 1
    document.getElementById('booking-form').reset();
    selectedBookDate = '';
    selectedBookSlot = '';
    onServiceOrBenefitChange();
    renderBookingCalendar();
    setBookStep(1);
    
    showToast(`ลงทะเบียนจองสำเร็จ หมายเลขคิวของคุณคือ ${queueNo}`, 'success');
}

// --- Success modal (Receipt) Management ---
function openSuccessModal(booking) {
    document.getElementById('ticket-number').textContent = booking.queueNo;
    document.getElementById('receipt-name').textContent = booking.name;
    
    // Mask phone number
    const phoneStr = booking.phone;
    let maskedPhone = phoneStr;
    if (phoneStr.length >= 9) {
        maskedPhone = phoneStr.slice(0, 3) + '-xxx-' + phoneStr.slice(-4);
    }
    document.getElementById('receipt-phone').textContent = maskedPhone;
    
    document.getElementById('receipt-service').textContent = SERVICE_NAMES[booking.service] || booking.service;
    document.getElementById('receipt-duration').textContent = `${booking.duration} นาที`;
    document.getElementById('receipt-therapist').textContent = THERAPIST_NAMES[booking.therapist] || booking.therapist;
    document.getElementById('receipt-time').textContent = booking.time;
    
    // Format date beautifully
    const d = new Date(booking.date);
    const monthsThai = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const formattedDate = `${d.getDate()} ${monthsThai[d.getMonth()]} ${d.getFullYear() + 543}`;
    document.getElementById('receipt-datetime').textContent = formattedDate;

    // Government benefit formatting on receipt
    const benefitRow = document.getElementById('receipt-benefit-row');
    const benefitVal = document.getElementById('receipt-benefit');
    const priceVal = document.getElementById('receipt-price');
    
    if (booking.benefit === 'Government') {
        benefitVal.textContent = 'ข้าราชการ (ใช้สิทธิ์จ่ายตรง)';
        benefitVal.className = 'text-success';
        if (benefitRow) benefitRow.style.display = 'flex';
    } else {
        benefitVal.textContent = 'บุคคลทั่วไป (ราคาปกติ)';
        benefitVal.className = 'text-muted';
        if (benefitRow) benefitRow.style.display = 'flex';
    }
    
    priceVal.textContent = `฿${booking.price}`;

    document.getElementById('booking-success-modal').classList.add('open');
}

function closeSuccessModal() {
    document.getElementById('booking-success-modal').classList.remove('open');
}

function closeSuccessModalAndGoToQueue() {
    closeSuccessModal();
    navigateTo('queue');
}

// --- Realtime Dashboard Rendering ---
function updateLiveDashboard() {
    // 1. Get filtered statuses
    const waitingList = bookings.filter(b => b.status === 'waiting')
                                .sort((a, b) => a.queueNo.localeCompare(b.queueNo));
    const servingList = bookings.filter(b => b.status === 'serving');
    const completedList = bookings.filter(b => b.status === 'completed')
                                  .sort((a, b) => b.id.localeCompare(a.id));

    // 2. Render Now Serving Board Widget
    const nowServingContainer = document.getElementById('now-serving-list');
    nowServingContainer.innerHTML = '';
    if (servingList.length > 0) {
        servingList.forEach(s => {
            const chip = document.createElement('span');
            chip.className = 'active-queue-chip';
            chip.textContent = s.queueNo;
            nowServingContainer.appendChild(chip);
        });
    } else {
        nowServingContainer.innerHTML = '<span class="text-muted" style="font-size: 0.95rem">ไม่มีผู้รับบริการขณะนี้</span>';
    }

    // 3. Render Next Up Board Widget
    const nextServingContainer = document.getElementById('next-serving-list');
    nextServingContainer.innerHTML = '';
    if (waitingList.length > 0) {
        const nextQueue = waitingList[0];
        const chip = document.createElement('span');
        chip.className = 'active-queue-chip pulse';
        chip.textContent = nextQueue.queueNo;
        nextServingContainer.appendChild(chip);
        
        // Update top Status Bar Text
        document.getElementById('top-queue-status').innerHTML = `ขณะนี้กำลังให้บริการคิว: ${servingList.map(s => s.queueNo).join(', ') || 'ไม่มี'} | คิวถัดไป: <strong>${nextQueue.queueNo}</strong>`;
    } else {
        nextServingContainer.innerHTML = '<span class="text-muted" style="font-size: 0.95rem">ไม่มีคิวรอถัดไป</span>';
        document.getElementById('top-queue-status').textContent = `ขณะนี้กำลังให้บริการคิว: ${servingList.map(s => s.queueNo).join(', ') || 'ไม่มี'} | ไม่มีคิวรอ`;
    }

    // 4. Update Board statistics
    const waitingCount = waitingList.length;
    document.getElementById('board-waiting-count').textContent = `${waitingCount} คิว`;
    
    // Average wait calculation (since rounds are fixed 90 mins, waiting is based on next rounds)
    const avgWaitMinutes = waitingCount * 20;
    document.getElementById('board-waiting-time').textContent = waitingCount > 0 ? `~${avgWaitMinutes} นาที` : '0 นาที';

    // 5. Update Column 1: Waiting
    const colWaiting = document.getElementById('col-list-waiting');
    document.getElementById('badge-count-waiting').textContent = waitingCount;
    colWaiting.innerHTML = '';
    
    if (waitingCount > 0) {
        waitingList.forEach(w => {
            colWaiting.appendChild(createQueueTicketDOM(w));
        });
    } else {
        colWaiting.innerHTML = '<div class="empty-state">ไม่มีคิวรอในขณะนี้</div>';
    }

    // 6. Update Column 2: Serving
    const colServing = document.getElementById('col-list-serving');
    document.getElementById('badge-count-serving').textContent = servingList.length;
    colServing.innerHTML = '';
    
    if (servingList.length > 0) {
        servingList.forEach(s => {
            colServing.appendChild(createQueueTicketDOM(s));
        });
    } else {
        colServing.innerHTML = '<div class="empty-state">ไม่มีผู้รับบริการขณะนี้</div>';
    }

    // 7. Update Column 3: Completed
    const colCompleted = document.getElementById('col-list-completed');
    document.getElementById('badge-count-completed').textContent = completedList.length;
    colCompleted.innerHTML = '';
    
    if (completedList.length > 0) {
        completedList.slice(0, 5).forEach(c => {
            colCompleted.appendChild(createQueueTicketDOM(c));
        });
    } else {
        colCompleted.innerHTML = '<div class="empty-state">ยังไม่มีรายการคิวเสร็จสิ้น</div>';
    }
    
    lucide.createIcons();
}

// Generate HTML elements for the Queue lists
function createQueueTicketDOM(booking) {
    const card = document.createElement('div');
    card.className = `queue-ticket-item status-border-${booking.status}`;
    
    // Map icons
    let serviceIcon = 'flower-2';
    if (booking.service === 'Foot Massage') serviceIcon = 'footprints';
    else if (booking.service === 'Herbal Massage') serviceIcon = 'leaf';
    
    const benefitText = booking.benefit === 'Government' ? ' <span class="admin-badge badge-serving" style="font-size: 0.65rem; padding: 1px 4px;">สิทธิ์ข้าราชการ</span>' : '';
    
    card.innerHTML = `
        <div class="ticket-main-info">
            <h5>${booking.queueNo}${benefitText}</h5>
            <div class="ticket-name-lbl">${booking.name}</div>
            <div class="ticket-desc-lbl">
                <i data-lucide="${serviceIcon}" class="icon-sm inline text-accent"></i> ${SERVICE_NAMES[booking.service] || booking.service}
            </div>
        </div>
        <div class="ticket-side-info">
            <span class="ticket-time-lbl" style="font-size: 0.72rem; color: var(--color-accent-gold-hover);"><i data-lucide="clock" class="icon-sm inline"></i> ${booking.time}</span>
            <span class="ticket-therapist-lbl"><i data-lucide="user" class="icon-sm inline"></i> ${THERAPIST_NAMES[booking.therapist] ? THERAPIST_NAMES[booking.therapist].split(' ')[0] : booking.therapist}</span>
        </div>
    `;
    return card;
}

// --- Live Queue Search Tool ---
function searchQueue() {
    const phoneInput = document.getElementById('search-phone-input').value.trim().replace(/[^0-9]/g, '');
    const resultArea = document.getElementById('search-result-area');
    
    if (!phoneInput) {
        showToast('กรุณากรอกเบอร์โทรศัพท์สำหรับค้นหา', 'warning');
        return;
    }
    
    // Find bookings with matching phone number
    const matches = bookings.filter(b => b.phone.replace(/[^0-9]/g, '') === phoneInput)
                            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    
    resultArea.classList.remove('hidden');
    resultArea.innerHTML = '';
    
    if (matches.length > 0) {
        matches.forEach(booking => {
            const card = document.createElement('div');
            card.className = 'result-card';
            
            // Format status badge
            let statusText = 'กำลังรอคิว';
            let badgeClass = 'badge-waiting';
            
            if (booking.status === 'serving') {
                statusText = 'กำลังรับบริการ';
                badgeClass = 'badge-serving';
            } else if (booking.status === 'completed') {
                statusText = 'เสร็จสิ้นแล้ว';
                badgeClass = 'badge-completed';
            } else if (booking.status === 'cancelled') {
                statusText = 'ยกเลิกแล้ว';
                badgeClass = 'badge-cancelled';
            }
            
            // Calc estimated waiting queue position
            let waitHintText = '';
            if (booking.status === 'waiting') {
                const waitingList = bookings.filter(b => b.status === 'waiting')
                                            .sort((a, b) => a.queueNo.localeCompare(b.queueNo));
                const index = waitingList.findIndex(w => w.id === booking.id);
                if (index === 0) {
                    waitHintText = 'คิวถัดไป! กรุณาเตรียมตัวเข้าบริการในรอบเวลานี้';
                } else if (index > 0) {
                    waitHintText = `รอคิวรับบริการถัดไปในรอบที่จอง`;
                }
            } else if (booking.status === 'serving') {
                waitHintText = 'ขณะนี้เจ้าหน้าที่กำลังให้บริการการรักษาแก่ท่าน';
            } else if (booking.status === 'completed') {
                waitHintText = 'ขอบคุณที่ใช้บริการ Pharmacy Health and Spa คณะเภสัชศาสตร์ มข.';
            } else {
                waitHintText = 'รายการจองนี้ถูกยกเลิกแล้ว';
            }

            const benefitLabelText = booking.benefit === 'Government' ? 'ข้าราชการ (จ่ายตรง ส่วนต่าง 100บ.)' : 'บุคคลทั่วไป';

            card.innerHTML = `
                <div class="result-header">
                    <span class="result-qno">${booking.queueNo}</span>
                    <span class="result-status-badge ${badgeClass}">${statusText}</span>
                </div>
                <div class="result-details-grid">
                    <div><strong>ผู้จอง:</strong> ${booking.name}</div>
                    <div><strong>รอบบริการ:</strong> ${booking.time} น. (${booking.date})</div>
                    <div><strong>บริการ:</strong> ${SERVICE_NAMES[booking.service] || booking.service}</div>
                    <div><strong>พนักงาน:</strong> ${THERAPIST_NAMES[booking.therapist] || booking.therapist}</div>
                    <div><strong>สิทธิ์ชำระเงิน:</strong> ${benefitLabelText}</div>
                    <div><strong>ค่าบริการ:</strong> ฿${booking.price}</div>
                </div>
                <div style="margin-top: 12px; font-size: 0.82rem; color: var(--color-primary-dark); font-weight: 500;">
                    <i data-lucide="sparkles" class="icon-sm inline text-accent" style="margin-right: 4px;"></i> ${waitHintText}
                </div>
            `;
            resultArea.appendChild(card);
        });
    } else {
        resultArea.innerHTML = `
            <div class="text-center text-muted" style="padding: 20px;">
                <i data-lucide="alert-circle" class="icon-title" style="margin: 0 auto 10px; display: block;"></i>
                ไม่พบข้อมูลการจองสำหรับเบอร์โทรนี้ กรุณาตรวจสอบเบอร์อีกครั้ง หรือกดจองคิวออนไลน์ใหม่
            </div>
        `;
    }
    
    lucide.createIcons();
}

// --- Admin Control Panel Rendering & Operations ---
function renderAdminConsole() {
    // 1. Update Counts
    const waitingList = bookings.filter(b => b.status === 'waiting');
    const servingList = bookings.filter(b => b.status === 'serving');
    const completedList = bookings.filter(b => b.status === 'completed');
    
    document.getElementById('astat-total').textContent = bookings.length;
    document.getElementById('astat-waiting').textContent = waitingList.length;
    document.getElementById('astat-serving').textContent = servingList.length;
    document.getElementById('astat-done').textContent = completedList.length;
    
    // 2. Render Administration Table Body
    const tbody = document.getElementById('admin-queue-tbody');
    tbody.innerHTML = '';
    
    // Sort all bookings by queueNo (pending/active first)
    const sortedBookings = [...bookings].sort((a, b) => {
        const statusWeight = { 'serving': 0, 'waiting': 1, 'completed': 2, 'cancelled': 3 };
        if (statusWeight[a.status] !== statusWeight[b.status]) {
            return statusWeight[a.status] - statusWeight[b.status];
        }
        return a.queueNo.localeCompare(b.queueNo);
    });

    if (sortedBookings.length > 0) {
        sortedBookings.forEach(booking => {
            const tr = document.createElement('tr');
            
            // Format status badge
            let badgeClass = 'badge-waiting';
            let statusText = 'รอคิว';
            if (booking.status === 'serving') { badgeClass = 'badge-serving'; statusText = 'กำลังนวด'; }
            else if (booking.status === 'completed') { badgeClass = 'badge-completed'; statusText = 'เสร็จสิ้น'; }
            else if (booking.status === 'cancelled') { badgeClass = 'badge-cancelled'; statusText = 'ยกเลิก'; }
            
            // Manage action buttons depending on current status
            let actionsHTML = '';
            if (booking.status === 'waiting') {
                actionsHTML = `
                    <button class="btn-admin btn-admin-call" onclick="adminCallQueue('${booking.id}')">
                        <i data-lucide="megaphone" class="icon-sm"></i> เรียกคิว
                    </button>
                    <button class="btn-admin btn-admin-serve" onclick="adminChangeStatus('${booking.id}', 'serving')">
                        <i data-lucide="play" class="icon-sm"></i> เริ่มนวด
                    </button>
                    <button class="btn-admin btn-admin-cancel" onclick="adminChangeStatus('${booking.id}', 'cancelled')">
                        <i data-lucide="x" class="icon-sm"></i> ยกเลิก
                    </button>
                `;
            } else if (booking.status === 'serving') {
                actionsHTML = `
                    <button class="btn-admin btn-admin-done" onclick="adminChangeStatus('${booking.id}', 'completed')">
                        <i data-lucide="check" class="icon-sm"></i> นวดเสร็จสิ้น
                    </button>
                    <button class="btn-admin btn-admin-cancel" onclick="adminChangeStatus('${booking.id}', 'cancelled')">
                        <i data-lucide="x" class="icon-sm"></i> ยกเลิก
                    </button>
                `;
            } else {
                actionsHTML = `<span class="text-muted" style="font-size: 0.8rem">จัดการแล้ว</span>`;
            }

            const benefitText = booking.benefit === 'Government' ? ' (ข้าราชการจ่ายตรง)' : ' (ทั่วไป)';

            tr.innerHTML = `
                <td><strong>${booking.queueNo}</strong></td>
                <td>
                    <div style="font-weight: 600;">${booking.name}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">${booking.phone}${benefitText}</div>
                </td>
                <td>
                    <div>${SERVICE_NAMES[booking.service] || booking.service}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">รอบ ${booking.time} น. (฿${booking.price})</div>
                </td>
                <td>${THERAPIST_NAMES[booking.therapist] ? THERAPIST_NAMES[booking.therapist].split(' ')[0] : booking.therapist}</td>
                <td><span class="admin-badge ${badgeClass}">${statusText}</span></td>
                <td><div class="actions-cell">${actionsHTML}</div></td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted" style="padding: 40px 0;">
                    ไม่มีคิวในระบบวันนี้ กดปุ่ม "จำลองคิวตัวอย่าง" เพื่อเริ่มต้นการทดสอบ
                </td>
            </tr>
        `;
    }
    
    renderTherapistDashboard();
    lucide.createIcons();
}

function adminChangeStatus(bookingId, newStatus) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    let msg = '';
    if (newStatus === 'serving')    msg = `เริ่มให้บริการคิว ${booking.queueNo} (${booking.name})`;
    else if (newStatus === 'completed') msg = `คิว ${booking.queueNo} รับบริการเสร็จสิ้นเรียบร้อย`;
    else if (newStatus === 'cancelled') msg = `ยกเลิกคิว ${booking.queueNo} เรียบร้อยแล้ว`;

    // Update in memory (Demo mode)
    booking.status = newStatus;
    showToast(msg, newStatus === 'cancelled' ? 'warning' : 'success');
    updateUI();
    renderAdminConsole();
}

function adminCallQueue(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        showToast(`🔔 ประกาศเรียกคิว: ${booking.queueNo} คุณ ${booking.name} เชิญติดต่อห้องรับรองค่ะ`, 'info');
    }
}

// Seed Mock Booking generator
function seedMockData() {
    const names = ['วิชัย ใจกว้าง', 'กัญญา เลิศล้ำ', 'ธนพล ลิมปนะ', 'มยุรี มีโชค', 'ปิยะ บุญช่วย', 'ศิริพร อรุณ'];
    const services = ['Thai Massage', 'Herbal Massage', 'Foot Massage'];
    const therapists = ['tu','ning','moo','liu','jiab','on','yu','oi','jim','tim','pong','dao','roj','maem'];
    const rounds = ['09:00 - 10:30', '10:40 - 12:10', '13:10 - 14:40', '14:50 - 16:20', '16:30 - 18:00'];
    
    let maxNum = bookings.reduce((max, b) => {
        const num = parseInt(b.queueNo.substring(1), 10);
        return num > max ? num : max;
    }, 0);

    const newBookings = [];
    for (let i = 0; i < 5; i++) {
        maxNum++;
        const service   = services[Math.floor(Math.random() * services.length)];
        const benefit   = (service === 'Thai Massage' && Math.random() > 0.5) ? 'Government' : 'General';
        const price     = service === 'Herbal Massage' ? 450 : (benefit === 'Government' ? 100 : 350);
        newBookings.push({
            id: 'B-' + (1000 + maxNum),
            queueNo: 'A' + String(maxNum).padStart(2, '0'),
            name: names[Math.floor(Math.random() * names.length)] + ' (ตัวอย่าง)',
            phone: '08' + Math.floor(10000000 + Math.random() * 90000000),
            service, duration: 90,
            therapist: therapists[Math.floor(Math.random() * therapists.length)],
            date: new Date().toISOString().split('T')[0],
            time: rounds[Math.floor(Math.random() * rounds.length)],
            benefit, price,
            note: 'คิวจำลองสำหรับการทดสอบระบบ',
            status: 'waiting', createdAt: new Date().toISOString()
        });
    }

    // Push in memory (Demo mode)
    newBookings.forEach(b => bookings.push(b));
    updateUI();
    renderAdminConsole();
    showToast('เพิ่มคิวจำลองจำนวน 5 รายการเรียบร้อยแล้ว', 'success');
}

// Clear all data
function clearAllQueues() {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างคิวทั้งหมด? ข้อมูลไม่สามารถกู้คืนได้')) {
        bookings = [];
        updateUI();
        renderAdminConsole();
        showToast('ล้างคิวทั้งหมดเรียบร้อยแล้ว', 'warning');
    }
}

// --- Common UI updates ---
function updateUI() {
    // Guards: some elements may not exist (removed sections)
    const waitingList = bookings.filter(b => b.status === 'waiting');
    const servingList = bookings.filter(b => b.status === 'serving');
    // Refresh booking calendar if visible
    if (document.getElementById('book-cal-grid')) renderBookingCalendar();
}

// --- Toast System ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    else if (type === 'warning') iconName = 'alert-triangle';
    
    toast.innerHTML = `
        <i data-lucide="${iconName}" class="toast-icon"></i>
        <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 4000);
}

// --- Monthly Calendar & Day Detail ---
const TIME_SLOTS = [
    { label: 'รอบ 1', time: '09:00 - 10:30' },
    { label: 'รอบ 2', time: '10:40 - 12:10' },
    { label: 'รอบ 3', time: '13:10 - 14:40' },
    { label: 'รอบ 4', time: '14:50 - 16:20' },
    { label: 'รอบ 5', time: '16:30 - 18:00' }
];

const THERAPIST_KEYS = Object.keys(THERAPIST_NAMES).filter(k => k !== 'Random');

let calViewYear  = new Date().getFullYear();
let calViewMonth = new Date().getMonth(); // 0-based

function changeMonth(delta) {
    calViewMonth += delta;
    if (calViewMonth < 0)  { calViewMonth = 11; calViewYear--; }
    if (calViewMonth > 11) { calViewMonth = 0;  calViewYear++; }
    renderCalendarBoard();
}

function renderCalendarBoard() {
    const grid  = document.getElementById('monthly-cal-grid');
    const label = document.getElementById('cal-month-label');
    if (!grid) return;

    const thMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                      'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    label.textContent = `${thMonths[calViewMonth]} ${calViewYear + 543}`;

    const firstDay  = new Date(calViewYear, calViewMonth, 1).getDay();
    const daysInMon = new Date(calViewYear, calViewMonth + 1, 0).getDate();
    const today     = new Date().toISOString().split('T')[0];

    grid.innerHTML = '';

    // Day-of-week headers
    ['อา','จ','อ','พ','พฤ','ศ','ส'].forEach(d => {
        const h = document.createElement('div');
        h.className = 'mcal-dow';
        h.textContent = d;
        grid.appendChild(h);
    });

    // Empty cells before 1st
    for (let i = 0; i < firstDay; i++) {
        grid.appendChild(Object.assign(document.createElement('div'), { className: 'mcal-cell mcal-empty' }));
    }

    // Day cells
    for (let day = 1; day <= daysInMon; day++) {
        const dateStr = `${calViewYear}-${String(calViewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const dayBookings = bookings.filter(b => b.date === dateStr);
        const isToday = dateStr === today;

        const cell = document.createElement('div');
        cell.className = `mcal-cell${isToday ? ' mcal-today' : ''}${dayBookings.length ? ' mcal-has-booking' : ''}`;
        cell.onclick = () => openDayDetail(dateStr, day);

        const num = document.createElement('span');
        num.className = 'mcal-day-num';
        num.textContent = day;
        cell.appendChild(num);

        if (dayBookings.length > 0) {
            const dot = document.createElement('span');
            dot.className = 'mcal-dot';
            dot.textContent = dayBookings.length + ' คิว';
            cell.appendChild(dot);
        }
        grid.appendChild(cell);
    }
}

function openDayDetail(dateStr, day) {
    const panel = document.getElementById('day-detail-panel');
    const schedGrid = document.getElementById('day-schedule-grid');
    const titleEl   = document.getElementById('day-detail-title');
    if (!panel) return;

    const thDays = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
    const d = new Date(dateStr + 'T00:00:00');
    const thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    titleEl.textContent = `วัน${thDays[d.getDay()]}ที่ ${day} ${thMonths[d.getMonth()]} ${d.getFullYear()+543}`;

    const dayBookings = bookings.filter(b => b.date === dateStr);

    schedGrid.innerHTML = '';

    // Column headers: slot labels
    const cornerDiv = document.createElement('div');
    cornerDiv.className = 'sched-corner';
    cornerDiv.textContent = 'หมอนวด / รอบ';
    schedGrid.appendChild(cornerDiv);

    TIME_SLOTS.forEach(slot => {
        const h = document.createElement('div');
        h.className = 'sched-slot-hdr';
        h.innerHTML = `<span>${slot.label}</span><small>${slot.time}</small>`;
        schedGrid.appendChild(h);
    });

    // Row per therapist
    THERAPIST_KEYS.forEach(key => {
        const nameEl = document.createElement('div');
        const nick = (THERAPIST_NAMES[key].match(/\(([^)]+)\)/)?.[1]) || key;
        nameEl.className = 'sched-therapist-name';
        nameEl.textContent = nick;
        nameEl.title = THERAPIST_NAMES[key];
        schedGrid.appendChild(nameEl);

        TIME_SLOTS.forEach(slot => {
            const b = dayBookings.find(bk => bk.therapist === key && bk.time === slot.time);
            const cell = document.createElement('div');
            cell.className = `sched-cell${b ? ' sched-cell-' + b.status : ' sched-cell-empty'}`;
            if (b) {
                cell.innerHTML = `<span class="sched-qno">${b.queueNo}</span><span class="sched-name">${b.name.split(' ')[0]}</span>`;
                cell.title = `${b.queueNo} ${b.name} | ${SERVICE_NAMES[b.service] || b.service}`;
            } else {
                cell.textContent = '—';
            }
            schedGrid.appendChild(cell);
        });
    });

    // Random/unassigned row
    const randEl = document.createElement('div');
    randEl.className = 'sched-therapist-name';
    randEl.textContent = 'สุ่ม';
    schedGrid.appendChild(randEl);
    TIME_SLOTS.forEach(slot => {
        const randBookings = dayBookings.filter(bk => bk.therapist === 'Random' && bk.time === slot.time);
        const cell = document.createElement('div');
        cell.className = `sched-cell${randBookings.length ? ' sched-cell-waiting' : ' sched-cell-empty'}`;
        cell.textContent = randBookings.length ? randBookings.map(b => b.queueNo).join(', ') : '—';
        schedGrid.appendChild(cell);
    });

    panel.classList.remove('hidden');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    lucide.createIcons();
}

function closeDayDetail() {
    document.getElementById('day-detail-panel')?.classList.add('hidden');
}

// --- Therapist Dashboard ---
function renderTherapistDashboard() {
    const container = document.getElementById('therapist-dashboard');
    if (!container) return;

    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === today && b.therapist !== 'Random');

    // Count per therapist
    const stats = {};
    Object.keys(THERAPIST_NAMES).forEach(key => {
        if (key === 'Random') return;
        stats[key] = { total: 0, completed: 0, serving: 0, waiting: 0 };
    });

    todayBookings.forEach(b => {
        if (stats[b.therapist]) {
            stats[b.therapist].total++;
            stats[b.therapist][b.status] = (stats[b.therapist][b.status] || 0) + 1;
        }
    });

    const maxTotal = Math.max(...Object.values(stats).map(s => s.total), 1);

    container.innerHTML = '';
    Object.entries(stats).forEach(([key, s]) => {
        const name = THERAPIST_NAMES[key] || key;
        const nickname = name.match(/\(([^)]+)\)/)?.[1] || name;
        const fullName = name.replace(/\s*\([^)]*\)/, '');
        const pct = Math.round((s.total / maxTotal) * 100);

        const row = document.createElement('div');
        row.className = 'th-row';
        row.innerHTML = `
            <div class="th-name">
                <span class="th-nick">${nickname}</span>
                <span class="th-full">${fullName}</span>
            </div>
            <div class="th-bar-wrap">
                <div class="th-bar" style="width:${pct}%"></div>
            </div>
            <div class="th-stats">
                <span class="th-stat th-total">${s.total}</span>
                <span class="th-stat th-done text-success">${s.completed}</span>
                <span class="th-stat th-serve" style="color:var(--color-accent-gold)">${s.serving}</span>
                <span class="th-stat th-wait text-muted">${s.waiting}</span>
            </div>
        `;
        container.appendChild(row);
    });
}

// --- System Clock Simulator ---
function updateAdminClock() {
    const clockEl = document.getElementById('system-time');
    if (!clockEl) return;
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hrs}:${mins}:${secs} น.`;
}

// --- Quota Tracking (21 มิ.ย. - 20 ก.ค. 2569) ---
const QUOTA_START = '2026-06-21';
const QUOTA_END   = '2026-07-20';
const CASE_RATE   = { 'Thai Massage': 170, 'Herbal Massage': 220, 'Foot Massage': 170 };

function renderQuotaSection() {
    const tbody = document.getElementById('quota-tbody');
    if (!tbody) return;

    const saved = JSON.parse(localStorage.getItem('spa_quotas') || '{}');
    const periodBookings = bookings.filter(b =>
        b.date >= QUOTA_START && b.date <= QUOTA_END && b.status !== 'cancelled'
    );

    tbody.innerHTML = '';
    let sumQuota = 0, sumDone = 0;

    THERAPIST_KEYS.forEach(key => {
        const fullName = THERAPIST_NAMES[key] || key;
        const nick = fullName.match(/\(([^)]+)\)/)?.[1] || key;
        const shortName = fullName.replace(/\s*\([^)]*\)/, '').split(' ').slice(0, 2).join(' ');
        const myBookings = periodBookings.filter(b => b.therapist === key);
        const done = myBookings.reduce((sum, b) => sum + (CASE_RATE[b.service] || 170), 0);
        const quota = parseInt(saved[key] || 0);
        const remaining = quota - done;
        sumQuota += quota;
        sumDone  += done;

        const colorClass = remaining < 0 ? 'style="color:#d32f2f;font-weight:700"'
                         : remaining === 0 && quota > 0 ? 'style="color:#888"'
                         : quota > 0 ? 'style="color:#1a7a30;font-weight:700"' : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td title="${fullName}">${shortName} <span style="color:#999;font-size:0.8rem">(${nick})</span></td>
            <td style="text-align:center;">
                <input type="number" id="quota-${key}" value="${quota}" min="0" step="100"
                    style="width:90px; padding:4px 6px; border:1px solid #ccc; border-radius:6px; text-align:right; font-size:0.85rem;"
                    oninput="liveRecalcQuota('${key}', ${done})">
            </td>
            <td style="text-align:right; font-weight:600;">${done > 0 ? done.toLocaleString() : '—'}</td>
            <td style="text-align:right;" id="quota-rem-${key}" ${colorClass}>${quota > 0 ? remaining.toLocaleString() : '—'}</td>
        `;
        tbody.appendChild(tr);
    });

    // Summary total row
    const totalRemaining = sumQuota - sumDone;
    const totalTr = document.createElement('tr');
    totalTr.style.borderTop = '2px solid var(--color-border)';
    totalTr.innerHTML = `
        <td><strong>รวมทั้งหมด</strong></td>
        <td style="text-align:center;"><strong>${sumQuota > 0 ? sumQuota.toLocaleString() : '—'}</strong></td>
        <td style="text-align:right;"><strong>${sumDone > 0 ? sumDone.toLocaleString() : '—'}</strong></td>
        <td style="text-align:right; ${totalRemaining < 0 ? 'color:#d32f2f' : 'color:#1a7a30'};"><strong>${sumQuota > 0 ? totalRemaining.toLocaleString() : '—'}</strong></td>
    `;
    tbody.appendChild(totalTr);
    lucide.createIcons();
}

function liveRecalcQuota(key, done) {
    const input = document.getElementById(`quota-${key}`);
    const remEl = document.getElementById(`quota-rem-${key}`);
    if (!input || !remEl) return;
    const quota = parseInt(input.value) || 0;
    const remaining = quota - done;
    remEl.textContent = quota > 0 ? remaining.toLocaleString() : '—';
    remEl.style.color = remaining < 0 ? '#d32f2f' : remaining === 0 ? '#888' : '#1a7a30';
    remEl.style.fontWeight = Math.abs(remaining) > 0 ? '700' : '';
}

function saveQuotaValues() {
    const quotas = {};
    THERAPIST_KEYS.forEach(key => {
        const input = document.getElementById(`quota-${key}`);
        if (input) quotas[key] = parseInt(input.value) || 0;
    });
    localStorage.setItem('spa_quotas', JSON.stringify(quotas));
    renderQuotaSection();
    const hint = document.getElementById('quota-save-hint');
    if (hint) hint.textContent = `✓ บันทึกแล้ว ${new Date().toLocaleTimeString('th-TH')}`;
    showToast('บันทึกโควต้าเรียบร้อย', 'success');
}
