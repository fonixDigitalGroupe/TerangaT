<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Payer {{ $merchant }} — Téranga</title>
    <style>
        :root { --blue:#1A84D8; --navy:#1a2233; --gray:#eef1f5; --border:#e2e6ec; --muted:#8a93a3; }
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background:var(--gray); color:var(--navy); }
        .header { background:var(--blue); color:#fff; padding:22px 18px 20px; }
        .header .brand { font-size:13px; opacity:.85; letter-spacing:1px; text-transform:uppercase; }
        .header .shop { font-size:22px; font-weight:800; margin-top:4px; }
        .wrap { max-width:440px; margin:0 auto; padding:18px; }
        .card { background:#fff; border:1px solid var(--border); border-radius:14px; padding:18px; }
        label { display:block; font-size:14px; font-weight:600; color:#26415e; margin:16px 0 8px; }
        label:first-of-type { margin-top:4px; }
        .seg { display:flex; gap:8px; }
        .seg button { flex:1; height:48px; border:1px solid var(--border); background:#fff; border-radius:10px; font-size:15px; font-weight:600; color:var(--navy); cursor:pointer; }
        .seg button.on { background:var(--blue); border-color:var(--blue); color:#fff; }
        .field { display:flex; align-items:center; border:1px solid var(--border); border-radius:10px; overflow:hidden; height:52px; background:#fff; }
        .field .prefix { display:flex; align-items:center; gap:6px; align-self:stretch; padding:0 12px; background:#f4f6f9; border-right:1px solid var(--border); font-size:15px; }
        .field input { flex:1; border:0; outline:0; font-size:16px; padding:0 14px; background:transparent; color:var(--navy); width:100%; }
        .summary { margin-top:16px; background:#f6f8fb; border:1px solid #e8ecf2; border-radius:10px; padding:14px; }
        .summary .row { display:flex; justify-content:space-between; font-size:14px; margin-bottom:8px; color:var(--muted); }
        .summary .row:last-child { margin-bottom:0; }
        .summary .row .v { color:var(--navy); font-weight:600; }
        .summary .row.total .v { color:var(--blue); font-size:16px; }
        .cta { width:100%; height:54px; border:0; border-radius:12px; background:var(--blue); color:#fff; font-size:17px; font-weight:700; margin-top:20px; cursor:pointer; }
        .cta:disabled { background:#9cc4ea; }
        .msg { margin-top:14px; padding:12px 14px; border-radius:10px; font-size:14px; line-height:20px; display:none; }
        .msg.err { background:#fdecea; color:#c0392b; }
        .msg.ok { background:#e8f6ef; color:#1e8e5a; }
        .foot { text-align:center; color:var(--muted); font-size:12px; margin-top:18px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="wrap" style="padding-bottom:0;">
            <div class="brand">Téranga · Paiement</div>
            <div class="shop">{{ $merchant }}</div>
        </div>
    </div>

    <div class="wrap">
        <div class="card">
            <label>Type d'opération</label>
            <div class="seg" id="typeSeg">
                <button type="button" data-v="depot" class="on">Dépôt</button>
                <button type="button" data-v="retrait">Retrait</button>
            </div>

            <label>Opérateur</label>
            <div class="seg" id="opSeg">
                <button type="button" data-v="wave" class="on">Wave</button>
                <button type="button" data-v="orange-money">Orange Money</button>
            </div>

            <label>Montant (FCFA)</label>
            <div class="field">
                <input id="amount" type="number" inputmode="numeric" placeholder="Ex : 5000" min="100" max="50000">
            </div>

            <label>Votre numéro</label>
            <div class="field">
                <span class="prefix">🇸🇳 +221</span>
                <input id="phone" type="tel" inputmode="numeric" placeholder="7X XXX XX XX" maxlength="9">
            </div>

            <div class="summary">
                <div class="row"><span>Montant</span><span class="v" id="sMontant">0 FCFA</span></div>
                <div class="row"><span>Frais</span><span class="v" id="sFrais">0 FCFA</span></div>
                <div class="row total"><span id="sTotalLabel">Total à payer</span><span class="v" id="sTotal">0 FCFA</span></div>
            </div>

            <div class="msg err" id="errBox"></div>
            <div class="msg ok" id="okBox"></div>

            <button class="cta" id="submitBtn">Continuer</button>
        </div>
        <div class="foot">Paiement sécurisé via Téranga Transfert</div>
    </div>

    <script>
        const FEE_GRID = @json(array_values($feeGrid));
        const CODE = @json($code);
        const CSRF = document.querySelector('meta[name=csrf-token]').content;

        let type = 'depot', operator = 'wave';

        const gridFee = (n) => {
            for (const t of FEE_GRID) if (n >= t.min && n <= t.max) return t.fee;
            return null;
        };
        const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';

        function seg(id, cb) {
            document.querySelectorAll('#' + id + ' button').forEach((b) => {
                b.addEventListener('click', () => {
                    document.querySelectorAll('#' + id + ' button').forEach((x) => x.classList.remove('on'));
                    b.classList.add('on');
                    cb(b.dataset.v);
                });
            });
        }
        seg('typeSeg', (v) => { type = v; render(); });
        seg('opSeg', (v) => { operator = v; });

        const amountEl = document.getElementById('amount');
        const phoneEl = document.getElementById('phone');
        amountEl.addEventListener('input', render);
        phoneEl.addEventListener('input', () => { phoneEl.value = phoneEl.value.replace(/\D/g, '').slice(0, 9); });

        function render() {
            const n = parseInt(amountEl.value || '0', 10) || 0;
            const fee = n > 0 ? gridFee(n) : 0;
            document.getElementById('sMontant').textContent = fmt(n);
            document.getElementById('sFrais').textContent = fee === null ? '—' : fmt(fee);
            document.getElementById('sTotalLabel').textContent = type === 'depot' ? 'Espèces à remettre' : 'Total à payer';
            document.getElementById('sTotal').textContent = (fee === null || n === 0) ? '—' : fmt(n + fee);
        }
        render();

        const btn = document.getElementById('submitBtn');
        const errBox = document.getElementById('errBox');
        const okBox = document.getElementById('okBox');

        btn.addEventListener('click', async () => {
            errBox.style.display = okBox.style.display = 'none';
            const amount = parseInt(amountEl.value || '0', 10) || 0;
            const phone = phoneEl.value.replace(/\D/g, '');
            if (amount < 100 || amount > 50000) return showErr('Le montant doit être compris entre 100 et 50 000 FCFA.');
            if (gridFee(amount) === null) return showErr('Montant hors grille tarifaire.');
            if (phone.length !== 9) return showErr('Entrez un numéro sénégalais valide (9 chiffres).');

            btn.disabled = true; btn.textContent = 'Traitement…';
            try {
                const res = await fetch('{{ route('pay.store', ['code' => '__CODE__']) }}'.replace('__CODE__', CODE), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': CSRF },
                    body: JSON.stringify({ type, operator, amount, client_phone: phone }),
                });
                const data = await res.json();
                if (!res.ok) { showErr(data.message || 'Une erreur est survenue.'); reset(); return; }
                if (data.pay_url) { window.location.href = data.pay_url; return; }
                showOk(data.message || 'Demande envoyée.');
                btn.textContent = 'Envoyé';
            } catch (e) {
                showErr('Connexion impossible. Réessayez.'); reset();
            }
        });

        function showErr(m) { errBox.textContent = m; errBox.style.display = 'block'; }
        function showOk(m) { okBox.textContent = m; okBox.style.display = 'block'; }
        function reset() { btn.disabled = false; btn.textContent = 'Continuer'; }
    </script>
</body>
</html>
