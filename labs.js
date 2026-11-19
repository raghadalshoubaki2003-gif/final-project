(() => {
  const page = document.body;
  const type = page.dataset.lab;
  const output = page.querySelector('[data-output]');
  const modeButtons = [...page.querySelectorAll('[data-mode]')];
  const payloadButtons = [...page.querySelectorAll('[data-payload]')];
  const esc = (s) => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let mode = 'vulnerable';
  let raceToken = 0;

  function message(title, lines, status, kind = '') {
    output.innerHTML = `<div class="output-title">${esc(title)}</div>${lines.map(line => `<p>${esc(line)}</p>`).join('')}<span class="status-pill ${kind}">${esc(status)}</span>`;
  }
  function setMode(next) {
    mode = next;
    modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
    payloadButtons.forEach(btn => btn.classList.remove('selected'));
    reset(false);
    output.innerHTML = '<p>Mode changed. Choose a payload to test this configuration.</p>';
  }
  function setRaceVisual(stateA, stateB, used) {
    const a = page.querySelector('[data-lane="A"]');
    const b = page.querySelector('[data-lane="B"]');
    [[a,stateA],[b,stateB]].forEach(([el,state]) => {
      el.classList.toggle('running', state === 'CHECKING' || state === 'CLAIMING');
      el.classList.toggle('done', state === 'CLAIMED' || state === 'REJECTED');
      el.querySelector('[data-lane-status]').textContent = state;
    });
    page.querySelector('[data-meter]').style.width = used ? '0%' : '100%';
    page.querySelector('[data-resource-state]').textContent = used ? 'CLAIMED' : 'AVAILABLE';
  }
  function reset(show = true) {
    raceToken++;
    payloadButtons.forEach(btn => btn.classList.remove('selected'));
    if (type === 'idor') output.innerHTML = '<p>Select a payload to query the fictional archive.</p>';
    if (type === 'mass') {
      page.querySelector('[data-name]').textContent = 'Rhea Vale';
      page.querySelector('[data-genetic]').textContent = 'UNVERIFIED';
      page.querySelector('[data-clearance]').textContent = 'RESIDENT';
      page.querySelector('[data-access]').textContent = 'RESIDENT';
      output.innerHTML = '<p>Profile restored to its original fictional state.</p>';
    }
    if (type === 'race') {
      setRaceVisual('STANDBY','STANDBY',false);
      output.innerHTML = '<p>Resource restored. Choose a payload to run the simulation.</p>';
    }
    if (!show) output.innerHTML = '';
  }
  modeButtons.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
  page.querySelector('[data-reset]').addEventListener('click', () => reset());

  payloadButtons.forEach(btn => btn.addEventListener('click', async () => {
    btn.classList.add('selected');
    if (type === 'idor') {
      const id = btn.dataset.payload === 'own' ? 'REC-104' : btn.dataset.payload === 'rec209' ? 'REC-209' : 'REC-317';
      const owner = {'REC-104':'citizen-104','REC-209':'citizen-209','REC-317':'citizen-317'}[id];
      const privateNote = {'REC-104':'Aptitude: Dauntless · Archive status: active','REC-209':'Aptitude: Amity · Archive status: confidential','REC-317':'Aptitude: Erudite · Archive status: confidential'}[id];
      if (mode === 'fixed' && id !== 'REC-104') message('ACCESS DENIED', [`Requested ${id} belongs to ${owner}, not the authenticated citizen.`, 'Owner-scoped lookup returned no accessible record.'], 'BLOCKED · OWNERSHIP CHECK', 'good');
      else message('RECORD RETRIEVED', [`${id} · Owner: ${owner}`, privateNote, id === 'REC-104' ? 'This is the authenticated citizen’s own record.' : 'A different citizen’s fictional record was exposed.'], id === 'REC-104' ? 'AUTHORIZED' : 'VULNERABLE · UNAUTHORIZED DISCLOSURE', id === 'REC-104' ? 'good' : 'bad');
    }
    if (type === 'mass') {
      const payload = btn.dataset.payload;
      if (payload === 'name') {
        page.querySelector('[data-name]').textContent = 'Rhea North';
        message('PROFILE UPDATED', ['displayName changed to “Rhea North”.', 'This is an allowed ordinary profile field.'], 'SUCCESS · DISPLAY NAME', 'good');
      } else if (mode === 'vulnerable') {
        if (payload === 'admin') {
          page.querySelector('[data-clearance]').textContent = 'ADMIN'; page.querySelector('[data-access]').textContent = 'ADMIN';
          message('UNRESTRICTED BINDING', ['Submitted clearanceLevel: ADMIN was copied onto the profile object.', 'A fictional privilege field changed without authorization.'], 'VULNERABLE · PRIVILEGE MODIFIED', 'bad');
        } else {
          page.querySelector('[data-genetic]').textContent = 'VERIFIED';
          message('UNRESTRICTED BINDING', ['Submitted geneticStatus: VERIFIED was copied onto the profile object.', 'A restricted fictional field changed from user input.'], 'VULNERABLE · ATTRIBUTE MODIFIED', 'bad');
        }
      } else {
        message('RESTRICTED FIELD IGNORED', [payload === 'admin' ? 'clearanceLevel is not in the permitted field allowlist.' : 'geneticStatus is not in the permitted field allowlist.', 'The profile remains unchanged; displayName updates are still permitted.'], 'BLOCKED · ALLOWLIST', 'good');
      }
    }
    if (type === 'race') {
      const token = ++raceToken;
      const both = btn.dataset.payload === 'both';
      if (!both) {
        setRaceVisual('CLAIMED','STANDBY',true);
        message('REQUEST A CLAIMED RESOURCE', ['One request checked availability and changed the resource state.', 'No competing request was issued.'], 'ONE CLAIM · EXPECTED', 'good');
        return;
      }
      setRaceVisual('CHECKING','CHECKING',false);
      output.innerHTML = '<div class="output-title">TWO REQUESTS IN FLIGHT</div><p>Both requests read the shared fictional state.</p><span class="status-pill">CHECKING…</span>';
      await new Promise(resolve => setTimeout(resolve, 430));
      if (token !== raceToken) return;
      if (mode === 'vulnerable') {
        setRaceVisual('CLAIMING','CLAIMING',false);
        output.innerHTML = '<div class="output-title">CHECK PASSED FOR A + B</div><p>Both saw AVAILABLE before either state update.</p><span class="status-pill">INTERLEAVING…</span>';
        await new Promise(resolve => setTimeout(resolve, 550));
        if (token !== raceToken) return;
        setRaceVisual('CLAIMED','CLAIMED',true);
        message('DOUBLE CLAIM SIMULATED', ['Request A: claimed. Request B: claimed from the same prior available state.', 'Claim counter: 2 · The resource is now inconsistent.'], 'VULNERABLE · TWO CLAIMS', 'bad');
      } else {
        setRaceVisual('CLAIMED','REJECTED',true);
        message('ATOMIC CLAIM COMPLETE', ['Request A: claimed. Request B: rejected because the conditional update found no available resource.', 'Claim counter: 1 · Only one request changed the state.'], 'FIXED · ONE CLAIM', 'good');
      }
    }
  }));
})();
