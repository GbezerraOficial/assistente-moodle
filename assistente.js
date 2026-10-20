(function() {
    // 1. Evita que o painel seja aberto duas vezes na mesma tela
    const painelAntigo = document.getElementById('painel-assistente-dema');
    if (painelAntigo) painelAntigo.remove();

    const tabelaParticipantes = document.querySelector('table#participants');
    const secaoRestricoes = document.querySelector('#id_availabilityconditionsheader, .availability-field');

    if (!tabelaParticipantes && !secaoRestricoes) {
        alert("O Assistente só funciona na aba 'Participantes' ou na tela de 'Restringir acesso' da atividade.");
        return;
    }

    const REGEX_MANHA = /\.\d*M\./i;
    const REGEX_TARDE = /\.\d*V\./i;

    // Carteiras da Planilha (Unidade Bojador)
    const INSTRUTORES_PADRAO = {
        "Guilherme — Empregabilidade": ["03872.APC09.0M.54","3872.APC09.0M.100","3872.APC09.0M.104","3872.APC09.0M.105","3872.APC09.0M.106","3872.APC09.0M.108","3872.APC09.0M.115","3872.APC09.0M.52","3872.APC09.0M.55","3872.APC09.0M.57","3872.APC09.0M.71","3872.APC09.0M.74","3872.APC09.0M.76","3872.APC09.0M.78","3872.APC09.0M.85","3872.APC09.0M.89","3872.APC09.0M.91","3872.APC09.0M.92","3872.APC09.0M.94","3872.APC09.0M.96","3872.APC09.0M.97","3872.APC09.0M.98","3872.APC09.0V.01","3872.APC09.0V.100","3872.APC09.0V.104","3872.APC09.0V.105","3872.APC09.0V.106","3872.APC09.0V.108","3872.APC09.0V.115","3872.APC09.0V.52","3872.APC09.0V.54","3872.APC09.0V.55","3872.APC09.0V.57","3872.APC09.0V.71","3872.APC09.0V.74","3872.APC09.0V.76","3872.APC09.0V.78","3872.APC09.0V.85","3872.APC09.0V.89","3872.APC09.0V.91","3872.APC09.0V.94","3872.APC09.0V.96","3872.APC09.0V.97","3872.APC09.0V.98","3872.APC09.1M.71","4.0.APC09.0M.91","4.0.APC09.0V.91","4.APC09.0M.71","4.APC09.0V.78","671.APC09.0M.105","671.APC09.0M.106","671.APC09.0M.54","671.APC09.0M.71","671.APC09.0M.74","671.APC09.0M.78","671.APC09.0M.85","671.APC09.0M.91","671.APC09.0M.97","671.APC09.0V.106","671.APC09.0V.54","671.APC09.0V.71","671.APC09.0V.74","671.APC09.0V.78","671.APC09.0V.85","671.APC09.0V.91","671.APC09.0V.96"],
        "Guilherme — Profissa 4.0": ["4.0.APC02.2M.91","4.0.APC02.2V.91","4.0.APC02.3M.91","4.0.APC02.3V.91","4.0.APC02.4M.91","4.0.APC02.4V.91","4.0.APC02.5M.91","4.0.APC02.5V.91","4.APC02.2M.54","4.APC02.2M.71","4.APC02.2M.85","4.APC02.2V.100","4.APC02.2V.71","4.APC02.2V.85","4.APC02.2V.94","4.APC02.3M.100","4.APC02.3M.74","4.APC02.3M.78","4.APC02.3M.79","4.APC02.3M.89","4.APC02.3V.100","4.APC02.3V.103","4.APC02.3V.78","4.APC02.4M.100","4.APC02.4M.103","4.APC02.4M.71","4.APC02.4M.98","4.APC02.4V.100","4.APC02.4V.103","4.APC02.4V.71","4.APC02.4V.74","4.APC02.4V.96","4.APC02.5M.100"],
        "Cleonice — Profissionalizante": ["3872.APC02.2M.100","3872.APC02.2M.103","3872.APC02.2M.108","3872.APC02.2M.113","3872.APC02.2M.52","3872.APC02.2M.54","3872.APC02.2M.71","3872.APC02.2M.85","3872.APC02.2M.89","3872.APC02.2M.91","3872.APC02.2M.96","3872.APC02.2M.98","3872.APC02.2V.100","3872.APC02.2V.104","3872.APC02.2V.106","3872.APC02.2V.108","3872.APC02.2V.71","3872.APC02.2V.78","3872.APC02.2V.85","3872.APC02.2V.89","3872.APC02.2V.91","3872.APC02.2V.98","3872.APC02.3M.104","3872.APC02.3M.96","3872.APC02.3V.104","3872.APC02.3V.52","3872.APC02.3V.54","3872.APC02.3V.96","3872.APC02.4M.100","3872.APC02.4M.113","3872.APC02.4M.52","3872.APC02.4M.54","3872.APC02.4M.57","3872.APC02.4M.85","3872.APC02.4M.94","3872.APC02.4M.96","3872.APC02.4V.100","3872.APC02.4V.103","3872.APC02.4V.113","3872.APC02.4V.54","3872.APC02.4V.85","3872.APC02.4V.96","3872.APC02.4V.98","3872.APC02.6M.106","3872.APC02.6V.106"],
        "Nibson — Profissionalizante": ["4.0.APC02.2M.91","4.0.APC02.2V.91","4.0.APC02.3M.91","4.0.APC02.3V.91","4.0.APC02.4M.91","4.0.APC02.4V.91","4.APC02.2M.71","4.APC02.2M.85","4.APC02.2V.100","4.APC02.2V.85","4.APC02.2V.94","4.APC02.3V.78","4.APC02.4M.100","4.APC02.4M.103","4.APC02.4M.71","4.APC02.4V.100","4.APC02.4V.71","4.APC02.4V.96","671.APC.02.4M.100","671.APC.02.4V.100","671.APC02.2M.54","671.APC02.2M.71","671.APC02.2M.91","671.APC02.2M.96","671.APC02.2M.98","671.APC02.2V.100","671.APC02.2V.104","671.APC02.2V.106","671.APC02.2V.71","671.APC02.2V.78","671.APC02.2V.91","671.APC02.2V.96","671.APC02.2V.98","671.APC02.3M.100","671.APC02.3M.78","671.APC02.3V.106","671.APC02.3V.71","671.APC02.3V.78","671.APC02.3V.96","671.APC02.4M.104","671.APC02.4M.106","671.APC02.4M.108","671.APC02.4M.54","671.APC02.4M.71","671.APC02.4M.74","671.APC02.4M.76","671.APC02.4M.85","671.APC02.4M.92","671.APC02.4M.97","671.APC02.4V.104","671.APC02.4V.54","671.APC02.4V.71","671.APC02.4V.78","671.APC02.4V.85","671.APC02.4V.97","671.APC02.4V.98","671.APC02.5V.71"],
        "Fernanda — Integração 6h": ["3872.APC00.0M.103","3872.APC00.0M.107","3872.APC00.0M.109","3872.APC00.0M.114","3872.APC00.0M.53","3872.APC00.0M.55","3872.APC00.0M.58","3872.APC00.0M.72","3872.APC00.0M.75","3872.APC00.0M.79","3872.APC00.0M.86","3872.APC00.0M.90","3872.APC00.0M.93","3872.APC00.0M.95","3872.APC00.0M.96","3872.APC00.0M.99","3872.APC00.0V.103","3872.APC00.0V.107","3872.APC00.0V.109","3872.APC00.0V.113","3872.APC00.0V.53","3872.APC00.0V.55","3872.APC00.0V.58","3872.APC00.0V.72","3872.APC00.0V.75","3872.APC00.0V.79","3872.APC00.0V.86","3872.APC00.0V.90","3872.APC00.0V.93","3872.APC00.0V.96","3872.APC00.0V.99"],
        "Glaucineia — Integração 4h": ["3872.APC00.0M.105","3872.APC00.0M.106","3872.APC00.0M.52","3872.APC00.0M.57","3872.APC00.0M.73","3872.APC00.0M.74","3872.APC00.0M.76","3872.APC00.0M.78","3872.APC00.0M.89","3872.APC00.0M.91","3872.APC00.0M.97","3872.APC00.0M.98","3872.APC00.0V.100","3872.APC00.0V.104","3872.APC00.0V.105","3872.APC00.0V.116","3872.APC00.0V.52","3872.APC00.0V.54","3872.APC00.0V.78","3872.APC00.0V.89","3872.APC00.0V.98"],
        "Marla — Integração 4h": ["3872.APC00.0M.100","3872.APC00.0M.108","3872.APC00.0M.114","3872.APC00.0M.115","3872.APC00.0M.116","3872.APC00.0M.54","3872.APC00.0M.85","3872.APC00.0M.94","3872.APC00.0V.106","3872.APC00.0V.108","3872.APC00.0V.57","3872.APC00.0V.71","3872.APC00.0V.74","3872.APC00.0V.76","3872.APC00.0V.85","3872.APC00.0V.91","3872.APC00.0V.94","3872.APC00.0V.97"],
        "Kleyton — Específico ADM": ["3872.APC01.2M.101","3872.APC01.2M.105","3872.APC01.2M.107","3872.APC01.2M.108","3872.APC01.2M.54","3872.APC01.2M.57","3872.APC01.2M.71","3872.APC01.2M.85","3872.APC01.2M.91","3872.APC01.2M.94","3872.APC01.2M.97","3872.APC01.2V.101","3872.APC01.2V.108","3872.APC01.2V.113","3872.APC01.2V.54","3872.APC01.2V.71","3872.APC01.2V.78","3872.APC01.2V.85","3872.APC01.2V.89","3872.APC01.2V.91","3872.APC01.2V.97","3872.APC01.5M.101","3872.APC01.5M.85","3872.APC01.5M.98","3872.APC01.5V.101","3872.APC01.5V.106","3872.APC01.5V.85","3872.APC01.5V.98","671.APC01.2M.74"],
        "Kleyton — Comércio e Varejo": ["3872.APC01.4M.110","3872.APC01.4M.113","3872.APC01.4M.55","3872.APC01.4M.86","3872.APC01.4V.108","3872.APC01.4V.110","3872.APC01.4V.113","3872.APC01.4V.55","3872.APC01.4V.86","671.APC01.4M.72"],
        "Luciana — Bancário Adolescente": ["3872.APC01.2M.52","3872.APC01.2M.55","3872.APC01.2V.106","3872.APC01.4M.104","3872.APC01.4M.106","3872.APC01.4M.109","3872.APC01.4M.54","3872.APC01.4M.72","3872.APC01.4M.76","3872.APC01.4M.85","3872.APC01.4M.89","3872.APC01.4M.92","3872.APC01.4M.94","3872.APC01.4M.97","3872.APC01.4V.104","3872.APC01.4V.109","3872.APC01.4V.85","3872.APC01.4V.89","3872.APC01.4V.92","3872.APC01.4V.96","671.APC01.4M.113","671.APC01.4V.101"],
        "Luciana — Bancário Jovem": ["3872.APC01.2M.104","3872.APC01.2M.90","3872.APC01.2V.104","3872.APC01.2V.96","3872.APC01.4M.115","3872.APC01.4V.101","3872.APC01.4V.103"]
    };

    const getInstrutorAtivo = () => localStorage.getItem('dema_instrutor_ativo') || 'TODAS';
    const normalizar = (s) => s.trim().replace(/^0+/, '');

    function obterTurmasDoInstrutor(chave) {
        const salvas = localStorage.getItem('dema_lista_' + chave);
        if (salvas) { try { return JSON.parse(salvas); } catch (e) {} }
        return INSTRUTORES_PADRAO[chave] || [];
    }

    function correspondeAoFiltro(texto, regexTurno) {
        if (!regexTurno.test(texto)) return false;
        const instrutor = getInstrutorAtivo();
        if (instrutor === 'TODAS') return true;
        const listaBase = obterTurmasDoInstrutor(instrutor);
        if (listaBase.length === 0) return true;
        return listaBase.some(cod => texto.includes(normalizar(cod)));
    }

    // Criação do Painel Flutuante
    const painel = document.createElement('div');
    painel.id = 'painel-assistente-dema';
    painel.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; z-index: 99999;
        background: #ffffff; border: 2px solid #001ae6; border-radius: 12px;
        box-shadow: 0 8px 28px rgba(0,0,0,0.22); padding: 14px;
        font-family: Arial, sans-serif; display: flex; flex-direction: column; gap: 8px;
        width: 290px;
    `;

    const header = document.createElement('div');
    header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e0e0e0; padding-bottom:6px;';
    header.innerHTML = `<strong style="color:#001ae6; font-size:13px;">⚡ Assistente Moodle Demà</strong>`;
    const btnMin = document.createElement('button');
    btnMin.type = 'button';
    btnMin.innerText = '—';
    btnMin.style.cssText = 'background:none; border:none; cursor:pointer; font-weight:bold; color:#666; font-size:14px;';
    header.appendChild(btnMin);
    painel.appendChild(header);

    const corpo = document.createElement('div');
    corpo.style.cssText = 'display:flex; flex-direction:column; gap:8px;';
    painel.appendChild(corpo);

    btnMin.onclick = () => {
        const oculto = corpo.style.display === 'none';
        corpo.style.display = oculto ? 'flex' : 'none';
        btnMin.innerText = oculto ? '—' : '➕';
    };

    const selectInstrutor = document.createElement('select');
    selectInstrutor.style.cssText = 'padding:6px; border-radius:6px; border:1px solid #ccc; font-size:12px; width:100%;';

    const atualizarOpcoesSelect = () => {
        const valorAtual = selectInstrutor.value || getInstrutorAtivo();
        selectInstrutor.innerHTML = '';

        const optTodas = document.createElement('option');
        optTodas.value = 'TODAS';
        optTodas.innerText = '🌐 Todas da Sala (.xM. / .xV.)';
        selectInstrutor.appendChild(optTodas);

        Object.keys(INSTRUTORES_PADRAO).forEach(nome => {
            const qtd = obterTurmasDoInstrutor(nome).length;
            const op = document.createElement('option');
            op.value = nome;
            op.innerText = `👤 ${nome} (${qtd})`;
            selectInstrutor.appendChild(op);
        });

        const qtdCustom = obterTurmasDoInstrutor('CUSTOM').length;
        const optCustom = document.createElement('option');
        optCustom.value = 'CUSTOM';
        optCustom.innerText = `✏️ Outro Instrutor / Lista (${qtdCustom})`;
        selectInstrutor.appendChild(optCustom);

        selectInstrutor.value = valorAtual;
    };

    atualizarOpcoesSelect();
    selectInstrutor.onchange = () => localStorage.setItem('dema_instrutor_ativo', selectInstrutor.value);
    
    corpo.innerHTML += `<label style="font-size:11px; color:#555; font-weight:bold; margin-bottom:-4px;">Filtro por Sala ou Instrutores:</label>`;
    corpo.appendChild(selectInstrutor);

    const btnGerenciarTurmas = document.createElement('button');
    btnGerenciarTurmas.type = 'button';
    btnGerenciarTurmas.innerText = '➕ Adicionar / Editar Turmas';
    btnGerenciarTurmas.style.cssText = `background:#eceff1; color:#1a237e; border:1px solid #b0bec5; padding:6px 10px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:11.5px; text-align:center;`;
    btnGerenciarTurmas.onclick = () => {
        let alvo = selectInstrutor.value;
        if (alvo === 'TODAS') {
            alert("ℹ️ MODO AUTOMÁTICO ATIVO:\n\nNeste modo qualquer turma com 'M' ou 'V' é reconhecida automaticamente.\n\nSe quiser editar a lista de um Instrutor, selecione o nome dele acima!");
            return;
        }
        const listaAtual = obterTurmasDoInstrutor(alvo).join('\n');
        const novaEntrada = prompt(`TURMAS DE: ${alvo}\n\nCole os códigos novos no final da lista. Para restaurar o padrão, apague tudo e dê OK.`, listaAtual);
        if (novaEntrada !== null) {
            const limpas = novaEntrada.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean);
            if (limpas.length === 0 && INSTRUTORES_PADRAO[alvo]) {
                localStorage.removeItem('dema_lista_' + alvo);
            } else {
                localStorage.setItem('dema_lista_' + alvo, JSON.stringify(limpas));
            }
            atualizarOpcoesSelect();
        }
    };
    corpo.appendChild(btnGerenciarTurmas);

    const criarBotao = (texto, corFundo, corTexto = '#fff') => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = texto;
        btn.style.cssText = `background:${corFundo}; color:${corTexto}; border:none; padding:9px 12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12.5px; text-align:left;`;
        return btn;
    };

    // ABA DE PARTICIPANTES
    if (tabelaParticipantes) {
        async function acionarParticipantes(regexTurno) {
            const btnMostrar = document.querySelector('a[data-action="showcount"]');
            if (btnMostrar) {
                const antes = document.querySelectorAll('table#participants tbody tr').length;
                btnMostrar.click();
                for (let i = 0; i < 30; i++) {
                    await new Promise(r => setTimeout(r, 200));
                    if (document.querySelectorAll('table#participants tbody tr').length > antes) break;
                }
                await new Promise(r => setTimeout(r, 400));
            }

            let marcados = 0;
            document.querySelectorAll('table#participants tbody tr').forEach(linha => {
                const cb = linha.querySelector('input[type="checkbox"]');
                if (cb) {
                    const pertence = correspondeAoFiltro(linha.innerText, regexTurno);
                    if (cb.checked !== pertence) cb.click();
                    if (pertence) marcados++;
                }
            });
            if (marcados === 0) { alert('Nenhum aluno encontrado para o filtro.'); return; }

            await new Promise(r => setTimeout(r, 300));
            const menuAcoes = document.querySelector('select#formactionid, select[name="formaction"]');
            if (menuAcoes) {
                menuAcoes.disabled = false;
                menuAcoes.selectedIndex = 0;
                const opMsg = Array.from(menuAcoes.options).find(x => x.value.includes('messageselect') || x.text.toLowerCase().includes('mensagem'));
                if (opMsg) {
                    menuAcoes.value = opMsg.value;
                    menuAcoes.dispatchEvent(new Event('change', { bubbles: true }));
                    await new Promise(r => setTimeout(r, 800));
                    const tx = document.querySelector('.modal textarea, textarea[data-region="send-message-txt"]');
                    if (tx) { tx.click(); tx.focus(); }
                }
            }
        }
        const btnM = criarBotao('☀️ Selecionar Manhã (M) + Msg', '#001ae6');
        btnM.onclick = () => acionarParticipantes(REGEX_MANHA);
        const btnV = criarBotao('🌇 Selecionar Tarde (V) + Msg', '#e65100');
        btnV.onclick = () => acionarParticipantes(REGEX_TARDE);
        corpo.appendChild(btnM); corpo.appendChild(btnV);
    }

    // TELA DE RESTRIÇÕES
    if (secaoRestricoes) {
        async function criarCaixaGrupo(bloco) {
            const ba = bloco.querySelector('.availability-button button');
            if (!ba) return null;
            ba.click();
            let bg = null;
            for (let i = 0; i < 15; i++) {
                await new Promise(r => setTimeout(r, 60));
                bg = document.querySelector('#availability_addrestriction_group') || Array.from(document.querySelectorAll('.moodle-dialogue-base button, .modal button')).find(x => x.innerText.trim() === 'Grupo');
                if (bg) break;
            }
            if (!bg) return null;
            bg.click();
            await new Promise(r => setTimeout(r, 80));
            const s = bloco.querySelectorAll('.availability_group select');
            return s[s.length - 1];
        }

        async function popularSubconjunto(bloco, regexTurno) {
            let s0 = bloco.querySelector('.availability_group select');
            if (!s0) s0 = await criarCaixaGrupo(bloco);
            if (!s0) return 0;

            const idsAlvo = Array.from(s0.options).filter(o => o.value && o.value !== 'choose' && correspondeAoFiltro(o.text, regexTurno)).map(o => o.value);
            let adicionadas = 0;
            for (const id of idsAlvo) {
                const atuais = Array.from(bloco.querySelectorAll('.availability_group select'));
                if (atuais.some(s => s.value === id)) continue;
                let alvo = atuais.find(s => s.value === '' || s.value === 'choose');
                if (!alvo) alvo = await criarCaixaGrupo(bloco);
                if (alvo) {
                    alvo.value = id; alvo.dispatchEvent(new Event('change', { bubbles: true }));
                    if (window.M && M.core_availability && M.core_availability.form) M.core_availability.form.update();
                    adicionadas++;
                    await new Promise(r => setTimeout(r, 45));
                }
            }
            return adicionadas;
        }

        const btnRestr = criarBotao('⚡ Adicionar Turmas M (1º) e V (2º)', '#001ae6');
        btnRestr.onclick = async () => {
            const subs = Array.from(document.querySelectorAll('.availability-childlist')).filter(e => !e.querySelector('.availability-childlist'));
            if (subs.length < 2) { alert('Abra os 2 blocos de grupos (1º Manhã e 2º Tarde)!'); return; }
            const addM = await popularSubconjunto(subs[0], REGEX_MANHA);
            const addV = await popularSubconjunto(subs[1], REGEX_TARDE);
            alert(`✅ Restrições concluídas!\n☀️ Manhã (M): +${addM} turmas\n🌇 Tarde (V): +${addV} turmas`);
        };
        corpo.appendChild(btnRestr);

        // Atualizar TODAS as datas (5 blocos ou mais)
        const btnData = criarBotao('📅 Atualizar Todas as Datas para Hoje', '#1565c0');
        btnData.onclick = () => {
            const hoje = new Date();
            const d = String(hoje.getDate()), m = String(hoje.getMonth() + 1), a = String(hoje.getFullYear());
            let c = 0;
            const blocosData = document.querySelectorAll('.availability_date');
            
            blocosData.forEach(b => {
                const sels = b.querySelectorAll('select');
                // O Moodle tem selects para: [0]Direção, [1]Dia, [2]Mês, [3]Ano, [4]Hora, [5]Minuto
                if (sels.length >= 4) {
                    sels[1].value = d; sels[1].dispatchEvent(new Event('change', { bubbles: true }));
                    sels[2].value = m; sels[2].dispatchEvent(new Event('change', { bubbles: true }));
                    sels[3].value = a; sels[3].dispatchEvent(new Event('change', { bubbles: true }));
                    c++;
                }
            });
            alert(`📅 Sucesso! ${c} blocos de data na tela foram atualizados para hoje (${d}/${m}/${a})!`);
        };
        corpo.appendChild(btnData);
    }

    document.body.appendChild(painel);
})();
