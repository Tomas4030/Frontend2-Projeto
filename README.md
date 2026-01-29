# 🎮 Life RPG: Gamificação da Vida Real

> "E se a tua vida funcionasse como um jogo RPG?"

A aplicação transforma tarefas do dia a dia em progresso de personagem. Em vez de apenas "ter de estudar", o utilizador foca-se em **"ganhar +25 XP em Inteligência"**. Não é apenas uma to-do list; é um sistema de progressão visual com atributos, níveis e recompensas.

---

## 💡 Conceito — Life XP System

O utilizador é tratado como um personagem de RPG. Tudo o que ele faz na vida real reflete-se na aplicação, aumentando a sua experiência (XP) e melhorando os seus atributos.

### 🧍‍♂️ Atributos do Personagem

| Atributo | Representação na Vida Real |
| :--- | :--- |
| **💪 Health** | Exercício, sono, alimentação |
| **🧠 Mind** | Estudo, leitura, foco |
| **💼 Career** | Trabalho, projetos |
| **🤝 Social** | Amigos, networking |
| **🎨 Creativity** | Hobbies, criatividade |

**Cada atributo possui:**
* XP próprio
* Nível próprio
* Progresso independente do nível geral do jogador.

---

## 🗺️ Estrutura da Aplicação

### 🏠 Dashboard (Ecrã Principal)
Visual inspirado em painéis de jogos:
* **Status:** Nível geral e barra de XP total.
* **Atributos:** Barras individuais de progresso.
* **Quests:** Missões de hoje e "Missão do Dia" em destaque.
* **Streak:** Contador de dias consecutivos.

### 📜 Missões (O Coração da App)
O utilizador cria tarefas como se fossem *Quests*.
* **Exemplo:** Nome: *Estudar React* | Atributo: *Mind* | XP: *20*.
* **Ações:** Concluir, Editar, Apagar.
* **Feedback:** Ao concluir, o sistema dispara animações de ganho de XP e verificação de Level Up.

### 📊 Stats (Análise de Dados)
Página focada em métricas para impressionar (e motivar):
* Gráfico semanal de produtividade.
* Atributo mais treinado (dominância).
* Rácio de missões concluídas vs. falhadas.

### 🧍 Perfil
* Customização de Avatar.
* **Títulos Desbloqueáveis:** "Iniciante", "Disciplinado", "Mestre da Consistência".

---

## ⚙️ Lógica do Sistema

### 🧮 Sistema de Níveis
A progressão segue uma fórmula matemática para garantir desafio crescente:
$$XP\_Necessário = Nível^2 \times 50$$

### 🔥 Streak System (Multiplicadores)
A consistência é premiada com bónus de XP:
* **3 dias:** +10% XP
* **7 dias:** +20% XP
* **30 dias:** Título especial e medalha de mestre.

---

## 🖥️ Arquitetura de Dados (Backend)

Estrutura simplificada para performance e clareza:

* **Users:** `id, nome, email, nivel, xp_total`
* **Skills:** `id, user_id, nome, xp`
* **Missions:** `id, user_id, nome, skill_id, xp_reward, frequencia`
* **MissionLogs:** `id, mission_id, data_conclusao`

> **Nota:** Os cálculos de progresso são feitos no Frontend para uma UI reativa, mantendo o Backend como uma API limpa de persistência.

---

## 🧩 Por que este projeto se destaca?

Para um recrutador, este projeto demonstra muito mais do que código básico:
1.  **Estado Complexo:** Gestão de múltiplos atributos e níveis.
2.  **Lógica Personalizada:** Algoritmos de XP e sistemas de Streak.
3.  **UX/UI Thought:** Design focado em psicologia comportamental e gamificação.
4.  **Produto Real:** Não é apenas um tutorial; é uma solução pensada para o utilizador.

---
*Projeto concebido para elevar o portfólio de "App de Tarefas" para "Sistema de Engenharia de Gamificação".* 🚀
