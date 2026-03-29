🔋 Sistema de Mana
Corrigir bug onde a mana não é consumida ao executar ações ✅
Corrigir regeneração de mana proveniente de itens da shop após X horas ✅
Rever e validar a lógica geral de consumo e regeneração de mana ✅

🛒 Shop / Loja
Corrigir o sistema de reset dos itens da shop (24h) ✅
Garantir que os itens voltam a ficar disponíveis após o cooldown ✅
Ajustar títulos dos itens da shop (evitar overflow / texto demasiado grande) ✅
Substituir sistema de alertas atual por alertas do shadcn/ui ✅
Validar comportamento geral da shop: ✅
-Refresh
-Timers
-Estados (disponível / comprado / cooldown)

📈 Sistema de Progressão
Definir nível máximo (999x) ✅
Implementar animação ao ganhar atributos ✅
Corrigir bug onde atributos não são perdidos em missões de derrota (loss) ✅

🎒 Inventário & Equipamentos ✅
Corrigir layout dos equipamentos ✅
Ajustar ícone de dinheiro no inventário ✅
Aumentar ligeiramente o tamanho da box do gold ✅

📜 Itens & Efeitos

Corrigir visualmente a Loja de Itens, mostrando um timer com o tempo restante do efeito de XP em dobro.
Alterar a duração do item de XP x2 de 24 horas para 30 minutos.
Adicionar mais itens à Loja de Itens.
Corrigir o bug em que o Pergaminho de XP não aplica corretamente o multiplicador x2 de XP.
Validar a aplicação correta de:
Buffs
Multiplicadores
Efeitos temporários
Mostrar na Loja de Itens a quantidade de itens que ainda podem ser comprados, por exemplo: 1/5.

🏆 Sistema de Prestígio
Implementar sistema de prestígio
Garantir transição correta ao atingir o nível máximo
Definir comportamento ao fazer prestígio:
Reset de atributos
Reset de stats
Manter/atribuir bónus de prestígio (se aplicável)

🎨 UI / UX
Remover scrollbar default
Implementar scrollbar custom (shadcn/ui)
Melhorar consistência visual geral:
Espaçamentos
Tipografia
Alinhamentos

🧪 Geral / Bugs
Testar fluxos principais:
Shop
Missões
Inventário
Progressão
Garantir consistência entre estados:
Reload
Timers
Resets

fix para meter na vercel
