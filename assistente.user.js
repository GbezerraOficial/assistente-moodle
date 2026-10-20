// ==UserScript==
// @name         Assistente Moodle Demà - Equipe Bojador (Auto-Update)
// @namespace    https://demadigital.renapsi.org.br/
// @version      3.0.0
// @description  Seleção automática de turmas (M/V), Busca Ativa, Mensagens e Restrições (5+ blocos) sincronizado via GitHub.
// @match        *://demadigital.renapsi.org.br/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Remove instância anterior caso a página recarregue o script
    const painelAntigo = document.getElementById('painel-assistente-dema');
    if (painelAntigo) painelAntigo.remove();

    const tabelaParticipantes = document.querySelector('table#participants');
    const secaoRestricoes = document.querySelector('#id_availabilityconditionsheader, .availability-field, [name="availabilityconditionsjson"]');

    if (!tabelaParticipantes && !secaoRestricoes) return;

    // Expressões Regulares Universais validadas para as 339 turmas (0M..6M e 0V..6V)
    const REGEX_MANHA = /\.\d*M\./i;
    const REGEX_TARDE = /\.\d*V\./i;

    // Turmas sinalizadas na planilha como "Turma a ser desativada"
    const TURMAS_DESATIVADAS = [
        "671.APC02.2V.100", "671.APC02.4M.54", "671.APC02.4V.54", "671.APC02.4V.78",
        "3872.APC01.4V.101", "3872.APC01.2M.52", "3872.APC01.2M.55", "671.APC01.4V.101"
    ];

    // Base oficial de turmas por Instrutor (Unidade Bojador - 339 turmas)
    // DICA: Sempre que quiser atualizar as turmas para toda a equipe, basta editar esta lista no GitHub!
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
        if (salvas) {
            try { return JSON.parse(salvas); } catch (e) {}
        }
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

    // Criação do Painel Flutuante (100% DOM API para preservar todos os eventos)
    const painel = document.createElement('div');
    painel.id = 'painel-assistente-dema';
    painel.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; z-index: 99999;
        background: #ffffff; border: 2px solid #001ae6; border-radius: 12px;
        box-shadow: 0 8px 28px rgba(0,0,0,0.24); padding: 14px;
        font-family: Arial, sans-serif; display: flex; flex-direction: column; gap: 7px;
        width: 305px;
    `;

    // Cabeçalho com Selo Nuvem v3.0 e Botão Minimizar
    const header = document.createElement('div');
    header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e0e0e0; padding-bottom:6px;';
    
    const titulo = document.createElement('strong');
    titulo.style.cssText = 'color:#001ae6; font-size:13px;';
    titulo.innerText = '⚡ Assistente Demà [Nuvem v3.0]';
    header.appendChild(titulo);

    const btnMin = document.createElement('button');
    btnMin.type = 'button';
    btnMin.innerText = '—';
    btnMin.style.cssText = 'background:none; border:none; cursor:pointer; font-weight:bold; color:#666; font-size:14px;';
    header.appendChild(btnMin);
    painel.appendChild(header);

    const corpo = document.createElement('div');
    corpo.style.cssText = 'display:flex; flex-direction:column; gap:7px;';
    painel.appendChild(corpo);

    btnMin.addEventListener('click', () => {
        const oculto = corpo.style.display === 'none';
        corpo.style.display = oculto ? 'flex' : 'none';
        btnMin.innerText = oculto ? '—' : '➕';
    });

    // 1. Seletor de Sala ou Instrutores
    const labelModo = document.createElement('label');
    labelModo.innerText = '1. Filtro por Sala ou Instrutores:';
    labelModo.style.cssText = 'font-size:11px; color:#555; font-weight:bold; margin-bottom:-3px;';
    corpo.appendChild(labelModo);

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
    selectInstrutor.addEventListener('change', () => {
        localStorage.setItem('dema_instrutor_ativo', selectInstrutor.value);
    });
    corpo.appendChild(selectInstrutor);

    // Botão Adicionar / Editar Turmas do Instrutor
    const btnGerenciarTurmas = document.createElement('button');
    btnGerenciarTurmas.type = 'button';
    btnGerenciarTurmas.innerText = '➕ Adicionar / Editar Turmas do Instrutor';
    btnGerenciarTurmas.style.cssText = 'background:#eceff1; color:#1a237e; border:1px solid #b0bec5; padding:6px 10px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:11px; text-align:center;';
    btnGerenciarTurmas.addEventListener('click', () => {
        const alvo = selectInstrutor.value;
        if (alvo === 'TODAS') {
            alert(
                "ℹ️ MODO AUTOMÁTICO ATIVO ('Todas da Sala'):\n\n" +
                "Neste modo, todas as turmas com 'M' ou 'V' da sala já entram sozinhas!\n\n" +
                "Para editar turmas de um Instrutor específico, selecione o nome dele no menu acima e clique aqui novamente."
            );
            return;
        }
        const listaAtual = obterTurmasDoInstrutor(alvo).join('\n');
        const novaEntrada = prompt(
            `TURMAS DE: ${alvo}\n\n` +
            `• Para ADICIONAR novas turmas: cole os códigos no final da lista.\n` +
            `• Para RESTAURAR o padrão da nuvem (GitHub): apague tudo e dê OK.`,
            listaAtual
        );
        if (novaEntrada !== null) {
            const limpas = novaEntrada.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean);
            if (limpas.length === 0 && INSTRUTORES_PADRAO[alvo]) {
                localStorage.removeItem('dema_lista_' + alvo);
                alert(`🔄 Lista de ${alvo} sincronizada com o padrão da nuvem!`);
            } else {
                localStorage.setItem('dema_lista_' + alvo, JSON.stringify(limpas));
                alert(`✅ Lista atualizada! ${alvo} agora possui ${limpas.length} turmas.`);
            }
            atualizarOpcoesSelect();
        }
    });
    corpo.appendChild(btnGerenciarTurmas);

    const criarBotao = (texto, corFundo, corTexto = '#fff') => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = texto;
        btn.style.cssText = `background:${corFundo}; color:${corTexto}; border:none; padding:8px 10px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px; text-align:center; width:100%;`;
        return btn;
    };

    // =========================================================================
    // MÓDULO 1: ABA DE PARTICIPANTES (BUSCA ATIVA + MENSAGEM AUTOMÁTICA)
    // =========================================================================
    if (tabelaParticipantes) {
        const labelEngajamento = document.createElement('label');
        labelEngajamento.innerText = '2. Filtro de Busca Ativa (Participantes):';
        labelEngajamento.style.cssText = 'font-size:11px; color:#bf360c; font-weight:bold; margin-top:4px; margin-bottom:-3px;';
        corpo.appendChild(labelEngajamento);

        const selectEngajamento = document.createElement('select');
        selectEngajamento.style.cssText = 'padding:5px; border-radius:6px; border:1px solid #ffb300; background:#fff8e1; font-size:11.5px; width:100%; font-weight:bold; color:#bf360c;';
        [
            { v: 'TODOS', t: '🎯 Todos os Jovens do Turno' },
            { v: 'NUNCA', t: '⚠️ Apenas quem "Nunca" acessou' },
            { v: 'AUSENTES7', t: '⏰ Ausentes há 7 dias ou mais' }
        ].forEach(item => {
            const op = document.createElement('option');
            op.value = item.v;
            op.innerText = item.t;
            selectEngajamento.appendChild(op);
        });
        corpo.appendChild(selectEngajamento);

        function passaFiltroEngajamento(textoLinha) {
            const modoEng = selectEngajamento.value;
            if (modoEng === 'TODOS') return true;
            if (modoEng === 'NUNCA') return /\bnunca\b/i.test(textoLinha);
            if (modoEng === 'AUSENTES7') {
                if (/\bnunca\b/i.test(textoLinha)) return true;
                if (/\b(mês|meses|ano|anos)\b/i.test(textoLinha)) return true;
                const matchDias = textoLinha.match(/(\d+)\s*dias?/i);
                return matchDias ? parseInt(matchDias[1], 10) >= 7 : false;
            }
            return true;
        }

        async function acionarParticipantes(regexTurno, nomeTurno) {
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
                    const pertence = correspondeAoFiltro(linha.innerText, regexTurno) && passaFiltroEngajamento(linha.innerText);
                    if (cb.checked !== pertence) cb.click();
                    if (pertence) marcados++;
                }
            });

            if (marcados === 0) {
                alert(`Nenhum jovem encontrado para o turno ${nomeTurno} com o filtro atual.`);
                return;
            }

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
                    if (tx) {
                        const msgPadrao = localStorage.getItem('dema_msg_padrao') || '';
                        if (msgPadrao && !tx.value) {
                            tx.value = msgPadrao;
                            tx.dispatchEvent(new Event('input', { bubbles: true }));
                            tx.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        tx.click();
                        tx.focus();
                    }
                }
            }
        }

        const linhaBotoesTurno = document.createElement('div');
        linhaBotoesTurno.style.cssText = 'display:flex; gap:6px;';

        const btnM = criarBotao('☀️ Manhã (M) + Msg', '#001ae6');
        btnM.addEventListener('click', () => acionarParticipantes(REGEX_MANHA, 'Matutino (M)'));

        const btnV = criarBotao('🌇 Tarde (V) + Msg', '#e65100');
        btnV.addEventListener('click', () => acionarParticipantes(REGEX_TARDE, 'Vespertino (V)'));

        linhaBotoesTurno.appendChild(btnM);
        linhaBotoesTurno.appendChild(btnV);
        corpo.appendChild(linhaBotoesTurno);

        // Botão para Configurar Texto Padrão de Mensagem
        const btnTemplate = document.createElement('button');
        btnTemplate.type = 'button';
        const atualizarTextoBtnTemplate = () => {
            const tem = Boolean(localStorage.getItem('dema_msg_padrao'));
            btnTemplate.innerText = tem ? '📝 Editar Texto Padrão (Ativo)' : '📝 Configurar Texto Padrão de Msg';
        };
        atualizarTextoBtnTemplate();
        btnTemplate.style.cssText = 'background:#f3e5f5; color:#4a148c; border:1px solid #ce93d8; padding:5px 8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:11px; text-align:center;';
        btnTemplate.addEventListener('click', () => {
            const atual = localStorage.getItem('dema_msg_padrao') || '';
            const resp = prompt(
                "TEXTO PADRÃO DE MENSAGEM:\n\n" +
                "Digite abaixo a mensagem que deve aparecer já preenchida quando a janela de mensagem abrir (ou deixe em branco para não preencher nada):",
                atual
            );
            if (resp !== null) {
                localStorage.setItem('dema_msg_padrao', resp.trim());
                atualizarTextoBtnTemplate();
            }
        });
        corpo.appendChild(btnTemplate);
    }

    // =========================================================================
    // MÓDULO 2: SEÇÃO RESTRINGIR ACESSO (TODOS OS 5+ BLOCOS DE GRUPOS E DATAS)
    // =========================================================================
    if (secaoRestricoes) {
        function sincronizarMoodleEJson(anoAlvo, mesAlvo, diaAlvo) {
            const atualizarDatas = Boolean(anoAlvo && mesAlvo && diaAlvo);

            const executarNoMoodle = (ano, mes, dia, mudarData) => {
                if (mudarData && window.Y) {
                    document.querySelectorAll('.availability_date').forEach(bloco => {
                        const sels = bloco.querySelectorAll('select');
                        const sHora = bloco.querySelector('select[data-field="hour"]') || sels[4];
                        const sMin = bloco.querySelector('select[data-field="minute"]') || sels[5];
                        const hora = sHora ? parseInt(sHora.value, 10) : 0;
                        const min = sMin ? parseInt(sMin.value, 10) : 0;

                        const ts = Math.floor(new Date(ano, mes - 1, dia, hora, min, 0).getTime() / 1000);
                        try {
                            const yNode = window.Y.one(bloco);
                            if (yNode && yNode.setData) yNode.setData('time', ts);
                        } catch (e) {}
                    });
                }

                if (window.M && M.core_availability && M.core_availability.form) {
                    try { M.core_availability.form.update(); } catch (e) {}
                }

                if (mudarData) {
                    const inputJson = document.querySelector('[name="availabilityconditionsjson"]');
                    if (inputJson && inputJson.value) {
                        try {
                            const arvore = JSON.parse(inputJson.value);
                            const varrerNos = (no) => {
                                if (!no || typeof no !== 'object') return;
                                if (no.type === 'date' && typeof no.t === 'number') {
                                    const dt = new Date(no.t * 1000);
                                    dt.setFullYear(ano, mes - 1, dia);
                                    no.t = Math.floor(dt.getTime() / 1000);
                                }
                                if (Array.isArray(no.c)) no.c.forEach(varrerNos);
                            };
                            varrerNos(arvore);
                            inputJson.value = JSON.stringify(arvore);
                        } catch (e) {}
                    }
                }
            };

            if (window.M || window.Y) {
                executarNoMoodle(anoAlvo, mesAlvo, diaAlvo, atualizarDatas);
            } else {
                const sc = document.createElement('script');
                sc.textContent = `(${executarNoMoodle.toString()})(${anoAlvo || 0}, ${mesAlvo || 0}, ${diaAlvo || 0}, ${atualizarDatas});`;
                document.documentElement.appendChild(sc);
                sc.remove();
            }
        }

        async function criarCaixaGrupo(bloco) {
            const ba = bloco.querySelector('.availability-button button');
            if (!ba) return null;
            ba.click();
            let bg = null;
            for (let i = 0; i < 15; i++) {
                await new Promise(r => setTimeout(r, 60));
                bg = document.querySelector('#availability_addrestriction_group') ||
                     Array.from(document.querySelectorAll('.moodle-dialogue-base button, .modal button'))
                          .find(x => x.innerText.trim() === 'Grupo');
                if (bg) break;
            }
            if (!bg) return null;
            bg.click();
            await new Promise(r => setTimeout(r, 80));
            const s = bloco.querySelectorAll('.availability_group select');
            return s[s.length - 1];
        }

        function detectarTurnoDoBloco(bloco, indice) {
            const selects = Array.from(bloco.querySelectorAll('.availability_group select'));
            let contM = 0, contV = 0;
            selects.forEach(s => {
                const op = s.options[s.selectedIndex];
                if (op && op.text) {
                    if (REGEX_MANHA.test(op.text)) contM++;
                    if (REGEX_TARDE.test(op.text)) contV++;
                }
            });
            if (contM > contV) return REGEX_MANHA;
            if (contV > contM) return REGEX_TARDE;

            const blocoPai = bloco.parentElement ? bloco.parentElement.closest('.availability-childlist, .availability-item') : null;
            if (blocoPai) {
                const sHora = blocoPai.querySelector('.availability_date select[data-field="hour"]');
                if (sHora) return parseInt(sHora.value, 10) < 12 ? REGEX_MANHA : REGEX_TARDE;
            }
            return indice % 2 === 0 ? REGEX_MANHA : REGEX_TARDE;
        }

        async function popularSubconjunto(bloco, regexTurno) {
            let s0 = bloco.querySelector('.availability_group select');
            if (!s0) s0 = await criarCaixaGrupo(bloco);
            if (!s0) return 0;

            const idsAlvo = Array.from(s0.options)
                .filter(o => o.value && o.value !== 'choose' && correspondeAoFiltro(o.text, regexTurno))
                .map(o => o.value);

            let adicionadas = 0;
            for (const id of idsAlvo) {
                const atuais = Array.from(bloco.querySelectorAll('.availability_group select'));
                if (atuais.some(s => s.value === id)) continue;
                let alvo = atuais.find(s => s.value === '' || s.value === 'choose');
                if (!alvo) alvo = await criarCaixaGrupo(bloco);
                if (alvo) {
                    alvo.value = id;
                    alvo.dispatchEvent(new Event('change', { bubbles: true }));
                    sincronizarMoodleEJson();
                    adicionadas++;
                    await new Promise(r => setTimeout(r, 45));
                }
            }
            return adicionadas;
        }

        const labelRestr = document.createElement('label');
        labelRestr.innerText = '2. Automação de Restrições (5+ Blocos):';
        labelRestr.style.cssText = 'font-size:11px; color:#1a237e; font-weight:bold; margin-top:4px; margin-bottom:-3px;';
        corpo.appendChild(labelRestr);

        // Botão 1: Preencher Grupos M e V em todos os blocos
        const btnRestr = criarBotao('⚡ Preencher Turmas M e V (Todos Blocos)', '#001ae6');
        btnRestr.addEventListener('click', async () => {
            const subs = Array.from(document.querySelectorAll('.availability-childlist'))
                .filter(e => !e.querySelector('.availability-childlist'));

            if (subs.length === 0) {
                alert('Abra a seção "Restringir acesso" contendo os blocos de grupos!');
                return;
            }

            let totalM = 0, totalV = 0;
            for (let i = 0; i < subs.length; i++) {
                const regexTurno = detectarTurnoDoBloco(subs[i], i);
                const qtd = await popularSubconjunto(subs[i], regexTurno);
                if (regexTurno === REGEX_MANHA) totalM += qtd;
                else totalV += qtd;
            }

            sincronizarMoodleEJson();
            alert(`✅ Concluído em ${subs.length} bloco(s)!\n☀️ Manhã (M): +${totalM} turmas\n🌇 Tarde (V): +${totalV} turmas`);
        });
        corpo.appendChild(btnRestr);

        // Botão 2: Seletor de Data (Hoje por padrão) + Aplicar em Todos os 5+ Blocos
        const linhaData = document.createElement('div');
        linhaData.style.cssText = 'display:flex; gap:5px; align-items:center;';

        const inputDate = document.createElement('input');
        inputDate.type = 'date';
        const hj = new Date();
        const yyyy = hj.getFullYear();
        const mm = String(hj.getMonth() + 1).padStart(2, '0');
        const dd = String(hj.getDate()).padStart(2, '0');
        inputDate.value = `${yyyy}-${mm}-${dd}`;
        inputDate.style.cssText = 'padding:6px 4px; border:1px solid #1565c0; border-radius:6px; font-size:11.5px; font-weight:bold; color:#1565c0; width:115px;';

        const btnData = criarBotao('📅 Aplicar Data (5+ Blocos)', '#1565c0');
        btnData.style.flex = '1';

        btnData.addEventListener('click', async () => {
            const partes = inputDate.value.split('-');
            const anoNum = parseInt(partes[0], 10);
            const mesNum = parseInt(partes[1], 10);
            const diaNum = parseInt(partes[2], 10);

            const a = String(anoNum), m = String(mesNum), d = String(diaNum);

            const conjuntosData = new Set();
            document.querySelectorAll('.availability_date').forEach(el => conjuntosData.add(el));
            document.querySelectorAll('select[data-field="day"]').forEach(sel => {
                const pai = sel.closest('.availability_date') || sel.parentElement;
                if (pai) conjuntosData.add(pai);
            });

            const listaBlocosData = Array.from(conjuntosData);
            if (listaBlocosData.length === 0) {
                alert('Nenhum bloco de data encontrado na tela!');
                return;
            }

            let atualizados = 0;
            for (const b of listaBlocosData) {
                const sels = b.querySelectorAll('select');
                const selDia = b.querySelector('select[data-field="day"]') || sels[1];
                const selMes = b.querySelector('select[data-field="month"]') || sels[2];
                const selAno = b.querySelector('select[data-field="year"]') || sels[3];

                if (selDia && selMes && selAno) {
                    for (const [sel, val] of [[selAno, a], [selMes, m], [selDia, d]]) {
                        sel.focus();
                        sel.dispatchEvent(new Event('focus', { bubbles: true }));
                        sel.value = val;
                        sel.dispatchEvent(new Event('input', { bubbles: true }));
                        sel.dispatchEvent(new Event('change', { bubbles: true }));
                        sel.dispatchEvent(new Event('blur', { bubbles: true }));
                    }
                    atualizados++;
                    await new Promise(r => setTimeout(r, 120));
                }
            }

            sincronizarMoodleEJson(anoNum, mesNum, diaNum);
            alert(`📅 Sucesso! Todas as ${atualizados} linhas de data (em todos os blocos) foram atualizadas para ${d}/${m}/${a}!`);
        });

        linhaData.appendChild(inputDate);
        linhaData.appendChild(btnData);
        corpo.appendChild(linhaData);

        // Botão 3: Limpador Inteligente de Turmas Erradas / Duplicadas / Desativadas
        const btnLimpar = criarBotao('🧹 Limpar Turmas Erradas / Desativadas', '#c62828');
        btnLimpar.addEventListener('click', async () => {
            const subs = Array.from(document.querySelectorAll('.availability-childlist'))
                .filter(e => !e.querySelector('.availability-childlist'));

            let removidas = 0;
            for (let i = 0; i < subs.length; i++) {
                const bloco = subs[i];
                const regexTurno = detectarTurnoDoBloco(bloco, i);
                const vistos = new Set();

                const itensGrupo = Array.from(bloco.querySelectorAll('.availability_group'));
                for (const itemGrupo of itensGrupo) {
                    const sel = itemGrupo.querySelector('select');
                    if (!sel) continue;
                    const op = sel.options[sel.selectedIndex];
                    const textoOp = op ? op.text.trim() : '';
                    const valOp = sel.value;

                    const ehVazio = !valOp || valOp === 'choose';
                    const ehDuplicado = valOp && vistos.has(valOp);
                    const ehDesativada = TURMAS_DESATIVADAS.some(td => textoOp.includes(normalizar(td)));
                    const foraDoFiltro = !ehVazio && !correspondeAoFiltro(textoOp, regexTurno);

                    if (ehVazio || ehDuplicado || ehDesativada || foraDoFiltro) {
                        const containerItem = itemGrupo.closest('.availability-item') || itemGrupo.parentElement;
                        const btnExcluir = containerItem ? containerItem.querySelector('.availability-delete img, .availability-delete, a[title*="Excluir"], a[role="button"]') : null;
                        if (btnExcluir) {
                            btnExcluir.click();
                            removidas++;
                            await new Promise(r => setTimeout(r, 50));
                        }
                    } else {
                        vistos.add(valOp);
                    }
                }
            }
            sincronizarMoodleEJson();
            alert(`🧹 Limpeza concluída! ${removidas} restrições de grupo (vazias, duplicadas, desativadas ou fora do filtro) foram removidas.`);
        });
        corpo.appendChild(btnLimpar);
    }

    document.body.appendChild(painel);
})();
