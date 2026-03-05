<template>
  <div class="qv-root">

    <template v-if="!activeQuiz">

      <div class="pro-page-header">
        <div>
          <h1 class="pro-page-title">Mes quiz</h1>
          <p class="pro-page-sub">{{ store.myQuizzes.length }} quiz créé(s)</p>
        </div>
        <button class="pro-btn pro-btn-green" @click="openCreate">
          <AppIcon name="plus" :size="15" /> Nouveau quiz
        </button>
      </div>

      <Transition name="slide-down">
        <div v-if="creating" class="create-box pro-card">
          <div class="create-box-head">
            <div class="create-box-icon"><AppIcon name="plus" :size="16" /></div>
            <span>Nouveau quiz</span>
          </div>

          <div class="create-box-fields">
            <div class="cbf-field">
              <label class="cbl">Titre du quiz *</label>
              <input v-model="createTitle" class="pro-input" placeholder="Ex : Quiz sur les additions…"
                autofocus @keydown.escape="creating=false" />
            </div>
            <div class="cbf-field">
              <label class="cbl">Matière</label>
              <select v-model="createSubjectId" class="pro-input" @change="onSubjectChange">
                <option :value="null">— Toutes les matières —</option>
                <option v-for="s in store.mySubjects" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="cbf-field">
              <label class="cbl">Cours associé</label>
              <select v-model="createCourseId" class="pro-input"
                :disabled="!filteredCoursesForCreate.length">
                <option :value="null">
                  {{ filteredCoursesForCreate.length ? '— Choisir un cours —' : 'Aucun cours disponible' }}
                </option>
                <option v-for="c in filteredCoursesForCreate" :key="c.id" :value="c.id">
                  {{ c.title }}
                </option>
              </select>
            </div>
          </div>

          <div class="create-box-actions">
            <button class="pro-btn pro-btn-ghost pro-btn-sm" @click="creating=false">Annuler</button>
            <button class="pro-btn pro-btn-green pro-btn-sm" @click="submitCreate"
              :disabled="!createTitle.trim()">
              <AppIcon name="check" :size="13" /> Créer et ajouter des questions
            </button>
          </div>
        </div>
      </Transition>

      <div v-if="store.myQuizzes.length" class="quiz-grid">
        <div v-for="q in store.myQuizzes" :key="q.id" class="quiz-card pro-card">

          <div class="qc-header">
            <div class="qc-icon"><AppIcon name="quiz" :size="20" /></div>
            <div class="qc-info">
              <div class="qc-title">{{ q.title }}</div>
              <div class="qc-course">{{ getCourseTitle(q.courseId) }}</div>
            </div>
            <button class="pro-icon-btn pro-icon-btn-danger qc-delete" @click.stop="deleteQuiz(q)">
              <AppIcon name="trash" :size="13" />
            </button>
          </div>

          <div class="qc-meta">
            <span class="qc-chip qc-chip-blue">
              <AppIcon name="quiz" :size="11" />
              {{ q.questions.length }} question{{ q.questions.length > 1 ? 's' : '' }}
            </span>
            <span v-if="store.getResultsByQuiz(q.id).filter(r=>r.status==='done').length"
              class="qc-chip qc-chip-green">
              <AppIcon name="check" :size="11" />
              {{ store.getResultsByQuiz(q.id).filter(r=>r.status==='done').length }} rendu(s)
            </span>
            <span v-if="store.getResultsByQuiz(q.id).length"
              class="qc-chip qc-chip-amber">
              <AppIcon name="chart" :size="11" />
              {{ store.getQuizStats(q.id).avg }}% moy.
            </span>
          </div>

          <div class="qc-actions">
            <button class="qca-btn qca-edit" @click="openEditor(q)">
              <AppIcon name="edit" :size="13" /> Modifier
            </button>
            <button class="qca-btn qca-results" @click="openResults(q)">
              <AppIcon name="results" :size="13" /> Résultats
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="!creating" class="pro-empty pro-card" style="padding:52px">
        <AppIcon name="quiz" :size="44" class="pro-empty-icon" />
        <p style="font-size:1rem;font-weight:800;margin:12px 0 4px">Aucun quiz créé</p>
        <p style="font-size:.85rem;color:var(--pro-muted);margin:0">Créez votre premier quiz interactif !</p>
        <button class="pro-btn pro-btn-green" style="margin-top:16px" @click="openCreate">
          <AppIcon name="plus" :size="15" /> Nouveau quiz
        </button>
      </div>
    </template>

    <template v-else-if="view === 'editor'">

      <div class="editor-header">
        <button class="back-btn" @click="closeQuiz">
          <AppIcon name="chevron-right" :size="14" style="transform:rotate(180deg)" />
          Mes quiz
        </button>
        <div class="editor-header-center">
          <div class="editor-badge">
            <AppIcon name="edit" :size="11" /> Édition
          </div>
          <h1 class="editor-title">{{ activeQuiz.title }}</h1>
          <p class="editor-sub">{{ getCourseTitle(activeQuiz.courseId) }}</p>
        </div>
        <div class="editor-header-actions">
          <button class="qca-btn qca-results" @click="openResults(activeQuiz)">
            <AppIcon name="results" :size="13" /> Résultats
          </button>
          <button class="pro-btn pro-btn-green" @click="publishQuiz"
            :disabled="!canPublish || publishing">
            <AppIcon name="publish" :size="14" />
            {{ publishing ? 'Publication…' : 'Publier' }}
          </button>
        </div>
      </div>

      <div class="publish-status-bar">
        <div class="psb-item" :class="{ 'psb-ok': activeQuiz.questions.length > 0 }">
          <AppIcon :name="activeQuiz.questions.length ? 'check' : 'x'" :size="11" />
          {{ activeQuiz.questions.length }} question{{ activeQuiz.questions.length > 1 ? 's' : '' }}
        </div>
        <div class="psb-item" :class="{ 'psb-ok': totalAnswers > 0 }">
          <AppIcon :name="totalAnswers ? 'check' : 'x'" :size="11" />
          {{ totalAnswers }} réponse{{ totalAnswers > 1 ? 's' : '' }}
        </div>
        <div class="psb-item" :class="{ 'psb-ok': canPublish }">
          <AppIcon :name="canPublish ? 'check' : 'x'" :size="11" />
          {{ canPublish ? 'Prêt à publier' : 'Chaque question doit avoir au moins 1 réponse' }}
        </div>
        <div v-if="publishSuccess" class="psb-success">
          <AppIcon name="check" :size="12" /> Quiz publié avec succès !
        </div>
      </div>

      <div class="questions-list">
        <div v-for="(qu, qi) in activeQuiz.questions" :key="qu.id" class="question-card">

          <div class="qcard-header">
            <div class="qcard-num">{{ qi + 1 }}</div>
            <div class="qcard-question-text">{{ qu.text }}</div>
            <button class="qcard-delete-btn" @click="deleteQuestion(qu)" title="Supprimer la question">
              <AppIcon name="trash" :size="13" />
            </button>
          </div>

          <div class="qcard-body">
            <div class="answers-list">
              <div v-for="(ans, ai) in qu.answers" :key="ans.id"
                class="answer-row" :class="getAnswerClass(ans)">

                <div class="ans-badge" :class="getAnswerBadgeClass(ans)">
                  {{ letters[ai] }}
                </div>

                <div class="ans-text-area">
                  <span class="ans-text">{{ ans.text }}</span>
                  <span v-if="ans.isCorrect" class="ans-correct-label">
                    <AppIcon name="check" :size="10" /> Correcte
                  </span>
                  <span v-else class="ans-incorrect-label">
                    <AppIcon name="x" :size="10" /> Incorrecte
                  </span>
                </div>

                <div class="ans-select-wrap">
                  <select class="ans-select" :value="ans.isCorrect ? 'correct' : 'incorrect'"
                    @change="handleAnswerCorrectChange(qu, ans, $event)">
                    <option value="correct">Correcte</option>
                    <option value="incorrect">Incorrecte</option>
                  </select>
                </div>

                <button class="ans-del-btn" @click="deleteAnswer(qu, ans)" title="Supprimer">
                  <AppIcon name="trash" :size="11" />
                </button>
              </div>

              <div v-if="addingAnswerTo === qu.id" class="answer-add-form">
                <div class="aaf-badge-ghost">{{ letters[qu.answers.length] }}</div>
                <input :ref="el => ansInputs[qu.id] = el"
                  v-model="answerDraft[qu.id]"
                  class="aaf-input"
                  placeholder="Écrire la réponse…"
                  @keydown.enter.prevent="submitAnswer(qu)"
                  @keydown.escape="addingAnswerTo=null" />
                <select v-model="correctDraft[qu.id]" class="aaf-select">
                  <option :value="true">Correcte</option>
                  <option :value="false">Incorrecte</option>
                </select>
                <button class="aaf-submit" :disabled="!answerDraft[qu.id]?.trim()" @click="submitAnswer(qu)">
                  <AppIcon name="check" :size="13" />
                </button>
                <button class="aaf-cancel" @click="addingAnswerTo=null">
                  <AppIcon name="x" :size="13" />
                </button>
              </div>

              <button v-else class="add-answer-btn" @click="openAddAnswer(qu)">
                <AppIcon name="plus" :size="13" />
                Ajouter une réponse
              </button>
            </div>
          </div>
        </div>

        <div v-if="addingQuestion" class="question-add-form">
          <div class="qaf-header">
            <div class="qcard-num qcard-num-ghost">{{ activeQuiz.questions.length + 1 }}</div>
            <input v-model="questionDraft" class="qaf-input"
              placeholder="Écrire la question ici…"
              @keydown.enter.prevent="submitQuestion"
              @keydown.escape="addingQuestion=false"
              autofocus />
            <button class="pro-btn pro-btn-green pro-btn-sm"
              :disabled="!questionDraft.trim()" @click="submitQuestion">
              <AppIcon name="check" :size="13" /> Ajouter
            </button>
            <button class="pro-icon-btn" @click="addingQuestion=false">
              <AppIcon name="x" :size="14" />
            </button>
          </div>
        </div>

        <button v-else class="add-question-btn" @click="addingQuestion=true">
          <AppIcon name="plus" :size="18" />
          Ajouter une question
        </button>

        <div v-if="!activeQuiz.questions.length && !addingQuestion" class="empty-questions">
          <AppIcon name="quiz" :size="40" class="pro-empty-icon" />
          <p>Commencez par ajouter votre première question.</p>
          <button class="pro-btn pro-btn-green" @click="addingQuestion=true">
            <AppIcon name="plus" :size="15" /> Première question
          </button>
        </div>
      </div>
    </template>

    <template v-else-if="view === 'results'">

      <div class="editor-header">
        <button class="back-btn" @click="closeResults">
          <AppIcon name="chevron-right" :size="14" style="transform:rotate(180deg)" />
          Retour
        </button>
        <div class="editor-header-center">
          <div class="editor-badge editor-badge-results">
            <AppIcon name="results" :size="11" /> Résultats
          </div>
          <h1 class="editor-title">{{ activeQuiz.title }}</h1>
          <p class="editor-sub">{{ getCourseTitle(activeQuiz.courseId) }}</p>
        </div>
        <div class="realtime-badge">
          <span class="rt-dot"></span>
          Temps réel
          <span class="rt-timer">{{ countdown }}s</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card stat-blue">
          <div class="stat-icon"><AppIcon name="teachers" :size="18" /></div>
          <div class="stat-val">{{ stats.doneCount }}</div>
          <div class="stat-label">Rendus</div>
        </div>
        <div class="stat-card stat-amber">
          <div class="stat-icon"><AppIcon name="clock" :size="18" /></div>
          <div class="stat-val">{{ stats.pendingCount }}</div>
          <div class="stat-label">En attente</div>
        </div>
        <div class="stat-card stat-green">
          <div class="stat-icon"><AppIcon name="chart" :size="18" /></div>
          <div class="stat-val">{{ stats.avg }}%</div>
          <div class="stat-label">Moyenne</div>
        </div>
        <div class="stat-card stat-violet">
          <div class="stat-icon"><AppIcon name="trophy" :size="18" /></div>
          <div class="stat-val">{{ stats.successRate }}%</div>
          <div class="stat-label">Réussite</div>
        </div>
      </div>

      <div class="pro-card results-card">
        <div class="results-header">
          <h2 class="results-title">
            <AppIcon name="results" :size="16" /> Notes des élèves
          </h2>
          <div style="display:flex;gap:6px">
            <button v-for="f in resultFilters" :key="f.value"
              class="filter-tab" :class="{ 'filter-tab-active': resultFilter===f.value }"
              @click="resultFilter=f.value">{{ f.label }}</button>
          </div>
        </div>

        <table class="results-table">
          <thead>
            <tr>
              <th>Élève</th>
              <th>Score</th>
              <th>Note</th>
              <th>Heure</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredResults" :key="r.id"
              :class="{ 'row-pending': r.status==='pending' }">
              <td>
                <div class="student-cell">
                  <div class="student-av">{{ r.studentName.charAt(0) }}</div>
                  {{ r.studentName }}
                </div>
              </td>
              <td>
                <div class="score-bar-wrap">
                  <div class="score-track">
                    <div class="score-fill"
                      :style="{ width: r.status==='done' ? pct(r)+'%' : '0%', background: scoreColor(r) }">
                    </div>
                  </div>
                  <span class="score-pct" :style="{ color: scoreColor(r) }">
                    {{ r.status==='done' ? pct(r)+'%' : '—' }}
                  </span>
                </div>
              </td>
              <td class="score-frac">
                <template v-if="r.status==='done'">
                  <strong>{{ r.score }}</strong><span style="color:var(--pro-muted)">/{{ r.total }}</span>
                </template>
                <span v-else style="color:var(--pro-muted)">—</span>
              </td>
              <td style="font-family:monospace;font-size:.8rem;color:var(--pro-muted)">
                {{ r.submittedAt ?? '—' }}
              </td>
              <td>
                <span class="status-badge" :class="r.status==='done' ? 'sb-done' : 'sb-pending'">
                  <AppIcon :name="r.status==='done' ? 'check' : 'clock'" :size="11" />
                  {{ r.status==='done' ? 'Rendu' : 'En cours' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!filteredResults.length" class="pro-empty" style="padding:28px">
          <AppIcon name="results" :size="28" class="pro-empty-icon" />
          <p>Aucun résultat dans cette catégorie.</p>
        </div>
      </div>

      <div class="pro-card">
        <h2 class="results-title" style="padding:16px 20px 0">
          <AppIcon name="chart" :size="16" /> Distribution des notes
        </h2>
        <div class="dist-chart">
          <div v-for="b in distribution" :key="b.label" class="dist-col">
            <div class="dist-bar-wrap">
              <div class="dist-bar" :style="{ height: b.height+'%', background: b.color }">
                <span v-if="b.count" class="dist-count">{{ b.count }}</span>
              </div>
            </div>
            <span class="dist-label">{{ b.label }}</span>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted, h, nextTick } from 'vue'

// ============================================================================
// 1. REPRODUCTION DE AppIcon.vue (Fonction de rendu)
// ============================================================================
function getIconInner(name) {
  switch (name) {
    case 'dashboard': return '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>';
    case 'teachers': return '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>';
    case 'user': return '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>';
    case 'user-plus': return '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>';
    case 'school': return '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>';
    case 'book': return '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>';
    case 'quiz': return '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
    case 'chart': return '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6"  y1="20" x2="6"  y2="14"/>';
    case 'lightning': return '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>';
    case 'plus': return '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5"  y1="12" x2="19" y2="12"/>';
    case 'edit': return '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>';
    case 'trash': return '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>';
    case 'search': return '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>';
    case 'filter': return '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>';
    case 'arrow-right': return '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>';
    case 'chevron-right': return '<polyline points="9 18 15 12 9 6"/>';
    case 'x': return '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6"  y1="6" x2="18" y2="18"/>';
    case 'check': return '<polyline points="20 6 9 17 4 12"/>';
    case 'eye': return '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    case 'ear': return '<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 0 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 0 1 0 4"/>';
    case 'hand': return '<path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10.5V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8H7a8 8 0 0 1-5.32-2"/><path d="M2 15H6"/>';
    case 'lock': return '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>';
    case 'mail': return '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>';
    case 'phone': return '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>';
    case 'calendar': return '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>';
    case 'layers': return '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>';
    case 'publish': return '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>';
    case 'palette': return '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-.5c0-.28.22-.5.5-.5s.5.22.5.5V20c0 1.1.9 2 2 2 4.42 0 8-4.48 8-10S17.52 2 12 2z"/>';
    case 'logout': return '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>';
    case 'assign': return '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>';
    case 'circle-fill': return '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/>';
    case 'more': return '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>';
    case 'warning': return '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
    case 'star': return '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>';
    case 'trophy': return '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>';
    case 'medal': return '<circle cx="12" cy="14" r="6"/><path d="M8.21 3.43c-.94.51-2.06.41-2.88-.26L4 2v6l2 1 2-1V2z"/><path d="M15.79 3.43c.94.51 2.06.41 2.88-.26L20 2v6l-2 1-2-1V2z"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/>';
    case 'results': return '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>';
    case 'clock': return '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>';
    case 'trend-up': return '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>';
    case 'trend-down': return '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>';
    case 'refresh': return '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>';
    default: return '<circle cx="12" cy="12" r="4"/>';
  }
}

const AppIcon = (props, { attrs }) => {
  return h('svg', {
    width: props.size || 20, height: props.size || 20, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': props.weight || 1.8,
    'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'aria-hidden': !props.label, 'aria-label': props.label, role: 'img',
    innerHTML: getIconInner(props.name),
    ...attrs
  })
}

// ============================================================================
// 2. REPRODUCTION DE useTeacherStore.js (Émulation)
// ============================================================================
const store = reactive({
  teacher: { id: 101 },
  mySubjects: [
    { id: 1, name: 'Mathématiques' },
    { id: 2, name: 'Français' },
    { id: 3, name: 'Histoire' }
  ],
  myCourses: [
    { id: 1, title: 'Introduction aux additions', subjectId: 1, teacherId: 101 },
    { id: 2, title: 'Lecture fluide', subjectId: 2, teacherId: 101 }
  ],
  myQuizzes: [
    {
      id: 1, title: 'Quiz sur les additions', courseId: 1, teacherId: 101,
      questions: [
        { id: 101, text: 'Combien font 2 + 3 ?', answers: [
          { id: 1001, text: '4', isCorrect: false },
          { id: 1002, text: '5', isCorrect: true },
          { id: 1003, text: '6', isCorrect: false }
        ]}
      ]
    }
  ],
  quizResults: [
    { id: 1, quizId: 1, studentName: 'Léo', status: 'done', score: 1, total: 1, submittedAt: '10:15' },
    { id: 2, quizId: 1, studentName: 'Mia', status: 'done', score: 0, total: 1, submittedAt: '10:18' },
    { id: 3, quizId: 1, studentName: 'Tom', status: 'pending', score: 0, total: 1, submittedAt: null }
  ],

  getCoursesBySubject(subjectId) {
    if (!subjectId) return this.myCourses
    return this.myCourses.filter(c => c.subjectId === subjectId)
  },
  
  addQuiz(data) {
    const quiz = { id: Date.now(), teacherId: this.teacher.id, courseId: data.courseId, title: data.title ?? '', questions: [] }
    this.myQuizzes.push(quiz)
    return quiz
  },
  deleteQuiz(id) {
    this.myQuizzes = this.myQuizzes.filter(q => q.id !== id)
  },
  
  addQuestion(quizId, data) {
    const quiz = this.myQuizzes.find(q => q.id === quizId)
    if (quiz) quiz.questions.push({ id: Date.now(), text: data.text || '', answers: [] })
  },
  deleteQuestion(quizId, questionId) {
    const quiz = this.myQuizzes.find(q => q.id === quizId)
    if (quiz) quiz.questions = quiz.questions.filter(q => q.id !== questionId)
  },
  
  addAnswer(quizId, questionId, data) {
    const quiz = this.myQuizzes.find(q => q.id === quizId)
    const question = quiz?.questions.find(q => q.id === questionId)
    if (question) {
      if (data.isCorrect) question.answers.forEach(a => a.isCorrect = false)
      question.answers.push({ id: Date.now(), text: data.text, isCorrect: data.isCorrect ?? false })
    }
  },
  updateAnswer(quizId, questionId, answerId, data) {
    const quiz = this.myQuizzes.find(q => q.id === quizId)
    const question = quiz?.questions.find(q => q.id === questionId)
    if (question) {
      if (data.isCorrect) question.answers.forEach(a => a.isCorrect = false)
      const ans = question.answers.find(a => a.id === answerId)
      if (ans) Object.assign(ans, data)
    }
  },
  deleteAnswer(quizId, questionId, answerId) {
    const quiz = this.myQuizzes.find(q => q.id === quizId)
    const question = quiz?.questions.find(q => q.id === questionId)
    if (question) question.answers = question.answers.filter(a => a.id !== answerId)
  },
  
  getResultsByQuiz(quizId) {
    return this.quizResults.filter(r => r.quizId === quizId)
  },
  getQuizStats(quizId) {
    const results = this.getResultsByQuiz(quizId).filter(r => r.status === 'done')
    if (!results.length) return { avg: 0, best: 0, worst: 0, doneCount: 0, pendingCount: 0, successRate: 0 }
    const scores = results.map(r => (r.score / r.total) * 100)
    return {
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      doneCount: results.length,
      pendingCount: this.getResultsByQuiz(quizId).filter(r => r.status === 'pending').length,
      successRate: Math.round(scores.filter(s => s >= 50).length / results.length * 100)
    }
  },
  
  _pollTimer: null,
  startResultsPolling(quizId) {
    this.stopResultsPolling()
    this._pollTimer = setInterval(() => {
      const pending = this.quizResults.filter(r => r.quizId === quizId && r.status === 'pending')
      if (pending.length) {
        const pick = pending[Math.floor(Math.random() * pending.length)]
        const quiz = this.myQuizzes.find(q => q.id === quizId)
        pick.total = quiz ? quiz.questions.length : 1
        pick.score = Math.floor(Math.random() * (pick.total + 1))
        const now = new Date()
        pick.submittedAt = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
        pick.status = 'done'
      }
    }, 8000)
  },
  stopResultsPolling() {
    if (this._pollTimer) { clearInterval(this._pollTimer); this._pollTimer = null }
  }
})

// ============================================================================
// 3. LOGIQUE DU COMPOSANT MES QUIZ
// ============================================================================
const letters = ['A','B','C','D','E','F','G','H']

const activeQuiz = ref(null)
const view       = ref('editor')

function getCourseTitle(id) {
  return store.myCourses.find(c => c.id === id)?.title || '—'
}

function openEditor(q) {
  activeQuiz.value = store.myQuizzes.find(x => x.id === q.id) ?? q
  view.value = 'editor'
  store.stopResultsPolling()
  stopCountdown()
}
function openResults(q) {
  activeQuiz.value = store.myQuizzes.find(x => x.id === q.id) ?? q
  view.value = 'results'
  resultFilter.value = 'all'
  store.startResultsPolling(q.id)
  startCountdown()
}
function closeQuiz() {
  activeQuiz.value = null
  store.stopResultsPolling()
  stopCountdown()
}
function closeResults() {
  view.value = 'editor'
  store.stopResultsPolling()
  stopCountdown()
}

onUnmounted(() => { store.stopResultsPolling(); stopCountdown() })

const creating        = ref(false)
const createTitle     = ref('')
const createSubjectId = ref(null)
const createCourseId  = ref(null)

const filteredCoursesForCreate = computed(() => store.getCoursesBySubject(createSubjectId.value))

function openCreate() {
  creating.value        = true
  createTitle.value     = ''
  createSubjectId.value = store.mySubjects.length === 1 ? store.mySubjects[0].id : null
  createCourseId.value  = null
}

function onSubjectChange() {
  if (createCourseId.value) {
    const still = filteredCoursesForCreate.value.find(c => c.id === createCourseId.value)
    if (!still) createCourseId.value = null
  }
}

function submitCreate() {
  if (!createTitle.value.trim()) return
  const quiz = store.addQuiz({
    title:    createTitle.value.trim(),
    courseId: createCourseId.value || null,
  })
  creating.value = false
  openEditor(quiz)
}
function deleteQuiz(q) {
  if (confirm(`Supprimer « ${q.title} » ?`)) store.deleteQuiz(q.id)
}

const addingQuestion = ref(false)
const questionDraft  = ref('')

function submitQuestion() {
  const text = questionDraft.value.trim()
  if (!text || !activeQuiz.value) return
  store.addQuestion(activeQuiz.value.id, { text })
  questionDraft.value  = ''
  addingQuestion.value = false
}
function deleteQuestion(qu) {
  if (confirm('Supprimer cette question ?')) store.deleteQuestion(activeQuiz.value.id, qu.id)
}

const addingAnswerTo = ref(null)
const answerDraft    = reactive({})
const correctDraft   = reactive({})
const ansInputs      = reactive({})

function openAddAnswer(qu) {
  addingAnswerTo.value = qu.id
  answerDraft[qu.id]   = ''
  correctDraft[qu.id]  = false
  nextTick(() => {
    if(ansInputs[qu.id]) ansInputs[qu.id].focus()
  })
}
function submitAnswer(qu) {
  const text = (answerDraft[qu.id] || '').trim()
  if (!text || !activeQuiz.value) return
  store.addAnswer(activeQuiz.value.id, qu.id, { text, isCorrect: !!correctDraft[qu.id] })
  addingAnswerTo.value = null
  answerDraft[qu.id]   = ''
  correctDraft[qu.id]  = false
}
function deleteAnswer(qu, ans) {
  store.deleteAnswer(activeQuiz.value.id, qu.id, ans.id)
}
function handleAnswerCorrectChange(qu, ans, event) {
  const isCorrect = event.target.value === 'correct'
  store.updateAnswer(activeQuiz.value.id, qu.id, ans.id, { isCorrect })
}

function getAnswerClass(ans) { return ans.isCorrect ? 'answer-correct' : 'answer-incorrect' }
function getAnswerBadgeClass(ans) { return ans.isCorrect ? 'ans-badge-correct' : 'ans-badge-incorrect' }

const publishing     = ref(false)
const publishSuccess = ref(false)

const totalAnswers = computed(() => activeQuiz.value?.questions.reduce((acc, qu) => acc + qu.answers.length, 0) ?? 0)
const canPublish = computed(() => activeQuiz.value?.questions.length > 0 && activeQuiz.value.questions.every(qu => qu.answers.length > 0))

async function publishQuiz() {
  if (!canPublish.value || !activeQuiz.value) return
  publishing.value = true; publishSuccess.value = false
  setTimeout(() => {
    publishing.value = false
    publishSuccess.value = true
    setTimeout(() => { publishSuccess.value = false }, 3000)
  }, 800)
}

const resultFilter  = ref('all')
const resultFilters = [
  { value: 'all',     label: 'Tous' },
  { value: 'done',    label: 'Rendus' },
  { value: 'pending', label: 'En attente' },
]

const quizResultsForActive = computed(() => activeQuiz.value ? store.getResultsByQuiz(activeQuiz.value.id) : [])
const filteredResults = computed(() => {
  if (resultFilter.value === 'all') return quizResultsForActive.value
  return quizResultsForActive.value.filter(r => r.status === resultFilter.value)
})
const stats = computed(() => activeQuiz.value ? store.getQuizStats(activeQuiz.value.id) : { avg:0, best:0, worst:0, doneCount:0, pendingCount:0, successRate:0 })

function pct(r) { return r.total ? Math.round((r.score / r.total) * 100) : 0 }
function scoreColor(r) {
  if (r.status !== 'done') return 'var(--pro-muted)'
  const p = pct(r)
  if (p >= 80) return 'var(--pro-green)'
  if (p >= 50) return 'var(--pro-amber)'
  return 'var(--pro-red)'
}

const distribution = computed(() => {
  const done = quizResultsForActive.value.filter(r => r.status === 'done')
  const buckets = [
    { label: '0–20%',   min:0,  max:20,  count:0, color:'var(--pro-red)' },
    { label: '20–40%',  min:20, max:40,  count:0, color:'#F97316' },
    { label: '40–60%',  min:40, max:60,  count:0, color:'var(--pro-amber)' },
    { label: '60–80%',  min:60, max:80,  count:0, color:'#65A30D' },
    { label: '80–100%', min:80, max:101, count:0, color:'var(--pro-green)' },
  ]
  done.forEach(r => {
    const p = pct(r)
    const b = buckets.find(b => p >= b.min && p < b.max)
    if (b) b.count++
  })
  const maxCount = Math.max(1, ...buckets.map(b => b.count))
  return buckets.map(b => ({ ...b, height: Math.max(4, (b.count / maxCount) * 100) }))
})

const countdown = ref(8)
let _cdTimer = null
function startCountdown() {
  countdown.value = 8; stopCountdown()
  _cdTimer = setInterval(() => { countdown.value--; if (countdown.value <= 0) countdown.value = 8 }, 1000)
}
function stopCountdown() { if (_cdTimer) { clearInterval(_cdTimer); _cdTimer = null } }
</script>

<style scoped>
/* ── IMPORT DES POLICES ─────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* ── VARIABLES ET THEME DE BASE ─────────────────── */
.qv-root {
  /* On attache les variables directement au conteneur principal */
  --pro-green: #10b981; --pro-green-soft: #d1fae5;
  --pro-blue: #3b82f6;  --pro-blue-soft: #dbeafe;
  --pro-amber: #f59e0b; --pro-amber-soft: #fef3c7;
  --pro-violet: #8b5cf6;
  --pro-red: #ef4444;   --pro-red-soft: #fee2e2;
  --pro-border: #e2e8f0;
  --pro-sub: #475569;
  --pro-muted: #94a3b8;
  --pro-ink: #0f172a;
  --pro-bg: #f8fafc;
  --pro-card: #ffffff;
  --pro-font: 'Plus Jakarta Sans', 'Nunito', system-ui, -apple-system, sans-serif;
  --pro-shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
  --pro-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  --pro-shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  --pro-r-md: 8px; --pro-r-lg: 12px;

  /* Styles de base du conteneur */
  display: flex; 
  flex-direction: column; 
  gap: 18px; 
  font-family: var(--pro-font);
}

.qv-root { display:flex; flex-direction:column; gap:18px; font-family: var(--pro-font); }

/* Éléments Pro génériques */
.pro-page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.pro-page-title { font-size: 1.8rem; font-weight: 900; color: var(--pro-ink); margin: 0; }
.pro-page-sub { font-size: 0.9rem; color: var(--pro-muted); margin: 4px 0 0 0; }
.pro-btn { 
  display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; 
  border-radius: 8px; font-size: 0.85rem; font-weight: 700; cursor: pointer; border: none; 
  transition: all 0.2s ease; white-space: nowrap; 
}
.pro-btn-green { background: var(--pro-green); color: white; }
.pro-btn-green:hover:not(:disabled) { background: #059669; }
.pro-btn-green:disabled { opacity:0.6; cursor:not-allowed; }
.pro-btn-ghost { background: transparent; border: 1.5px solid var(--pro-border); color: var(--pro-ink); }
.pro-btn-ghost:hover { background: var(--pro-bg); }
.pro-btn-sm { padding: 6px 12px; font-size: 0.8rem; }
.pro-icon-btn { 
  display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; 
  border-radius: 8px; border: 1.5px solid var(--pro-border); background: white; cursor: pointer; 
  transition: all .15s ease; 
}
.pro-icon-btn-danger { color: var(--pro-red); border-color: transparent; }
.pro-icon-btn-danger:hover { background: #fef2f2; border-color: #fecaca; }
.pro-card { background: white; border: 1.5px solid var(--pro-border); border-radius: var(--pro-r-lg); overflow: hidden; }
.pro-input { width: 100%; padding: 8px 12px; border: 1.5px solid var(--pro-border); border-radius: 8px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
.pro-input:focus { border-color: var(--pro-green); }

/* ── Transition ─────────────────────────────────── */
.slide-down-enter-active { transition: all .25s ease; }
.slide-down-enter-from   { opacity:0; transform:translateY(-10px); }

/* ── Bouton retour ──────────────────────────────── */
.back-btn {
  display:inline-flex; align-items:center; gap:5px;
  font-size:0.8rem; font-weight:700; color:var(--pro-sub);
  border:none; background:none; cursor:pointer;
  padding:5px 0; transition:color .15s; flex-shrink:0;
}
.back-btn:hover { color:var(--pro-green); }

/* ── Formulaire création inline ─────────────────── */
.create-box {
  padding:20px; display:flex; flex-direction:column; gap:16px;
  border:2px dashed rgba(16,185,129,.35); background:rgba(16,185,129,.03);
}
.create-box-head { display:flex; align-items:center; gap:10px; font-size:0.88rem; font-weight:800; color:var(--pro-green); }
.create-box-icon { width:30px; height:30px; border-radius:8px; background:var(--pro-green-soft); color:var(--pro-green); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.create-box-fields { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media(max-width:600px) { .create-box-fields { grid-template-columns:1fr; } }
.cbf-field { display:flex; flex-direction:column; gap:5px; }
.cbl { font-size:0.76rem; font-weight:700; color:var(--pro-sub); }
.create-box-actions { display:flex; gap:8px; justify-content:flex-end; }

/* ── Grille quiz ────────────────────────────────── */
.quiz-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:14px; }
.quiz-card { padding:0; display:flex; flex-direction:column; overflow:hidden; transition: transform 0.2s, box-shadow 0.2s; }
.quiz-card:hover { transform: translateY(-2px); box-shadow: var(--pro-shadow-lg); }

.qc-header { display:flex; align-items:flex-start; gap:12px; padding:16px 16px 12px; border-bottom:1px solid var(--pro-border); }
.qc-icon { width:40px; height:40px; border-radius:10px; flex-shrink:0; background:var(--pro-green-soft); color:var(--pro-green); display:flex; align-items:center; justify-content:center; }
.qc-info { flex:1; min-width:0; }
.qc-title  { font-size:.92rem; font-weight:800; color:var(--pro-ink); line-height:1.3; }
.qc-course { font-size:.72rem; color:var(--pro-muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.qc-delete { opacity:0; transition:opacity .15s; }
.quiz-card:hover .qc-delete { opacity:1; }

.qc-meta { display:flex; gap:6px; flex-wrap:wrap; padding:10px 16px; }
.qc-chip { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:100px; font-size:0.7rem; font-weight:700; }
.qc-chip-blue   { background:var(--pro-blue-soft);   color:var(--pro-blue);   }
.qc-chip-green  { background:var(--pro-green-soft);  color:var(--pro-green);  }
.qc-chip-amber  { background:rgba(245,158,11,.1);      color:var(--pro-amber);  }

.qc-actions { display:flex; gap:0; margin-top:auto; border-top:1px solid var(--pro-border); }
.qca-btn {
  flex:1; display:flex; align-items:center; justify-content:center; gap:6px;
  padding:11px; border:none; cursor:pointer; font-size:.78rem; font-weight:700; 
  transition:all .15s;
}
.qca-btn:not(:last-child) { border-right:1px solid var(--pro-border); }
.qca-edit    { background:white; color:var(--pro-sub); }
.qca-edit:hover { background:var(--pro-bg); color:var(--pro-ink); }
.qca-results { background:white; color:var(--pro-blue); }
.qca-results:hover { background:var(--pro-blue-soft); }

/* ── Header éditeur ─────────────────────────────── */
.editor-header { display:flex; align-items:flex-start; gap:16px; flex-wrap:wrap; padding-bottom:18px; border-bottom:1.5px solid var(--pro-border); }
.editor-header-center { flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; }
.editor-badge {
  display:inline-flex; align-items:center; gap:5px; align-self:flex-start;
  padding:3px 10px; border-radius:100px; font-size:.68rem; font-weight:800; text-transform:uppercase; letter-spacing:.07em;
  background:var(--pro-green-soft); color:var(--pro-green);
}
.editor-badge-results { background:var(--pro-blue-soft); color:var(--pro-blue); }
.editor-title { font-size:1.25rem; font-weight:900; color:var(--pro-ink); margin:0; line-height:1.2; }
.editor-sub   { font-size:.78rem; color:var(--pro-muted); margin:0; }
.editor-header-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; flex-wrap:wrap; }

/* ── Barre statut publication ───────────────────── */
.publish-status-bar {
  display:flex; align-items:center; gap:8px; flex-wrap:wrap;
  padding:10px 16px; border-radius:var(--pro-r-md); background:var(--pro-bg); border:1.5px solid var(--pro-border);
}
.psb-item { display:inline-flex; align-items:center; gap:5px; font-size:.75rem; font-weight:600; color:var(--pro-muted); padding:3px 8px; border-radius:6px; background:white; border:1px solid var(--pro-border); }
.psb-ok { color:var(--pro-green); background:var(--pro-green-soft); border-color:rgba(16,185,129,.2); }
.psb-success {
  display:inline-flex; align-items:center; gap:5px; font-size:.75rem; font-weight:700; color:var(--pro-green);
  padding:4px 10px; border-radius:6px; background:var(--pro-green-soft); border:1px solid rgba(16,185,129,.2); margin-left:auto;
}

/* ── Liste questions ────────────────────────────── */
.questions-list { display:flex; flex-direction:column; gap:12px; }

/* ── Carte question ─────────────────────────────── */
.question-card {
  background:white; border:1.5px solid var(--pro-border); border-radius:var(--pro-r-lg); overflow:hidden;
  box-shadow:var(--pro-shadow-sm); transition:box-shadow .15s;
}
.question-card:hover { box-shadow:var(--pro-shadow-md); }

.qcard-header {
  display:flex; align-items:center; gap:12px; padding:14px 18px; background:linear-gradient(to right, #f8fafc, #f1f5f9); border-bottom:1px solid var(--pro-border);
}
.qcard-num { width:28px; height:28px; border-radius:8px; flex-shrink:0; background:var(--pro-green); color:white; font-size:.72rem; font-weight:900; display:flex; align-items:center; justify-content:center; }
.qcard-num-ghost { background:var(--pro-border); color:var(--pro-muted); }
.qcard-question-text { flex:1; font-size:.92rem; font-weight:700; color:var(--pro-ink); line-height:1.4; }
.qcard-delete-btn {
  width:30px; height:30px; border-radius:8px; flex-shrink:0; border:1.5px solid var(--pro-border); background:white; color:var(--pro-red); cursor:pointer;
  display:flex; align-items:center; justify-content:center; opacity:0; transition:all .15s;
}
.question-card:hover .qcard-delete-btn { opacity:1; }
.qcard-delete-btn:hover { background:var(--pro-red); color:white; border-color:var(--pro-red); }

.qcard-body { padding:12px 18px 14px; }

/* ── Liste des réponses ─────────────────────────── */
.answers-list { display:flex; flex-direction:column; gap:6px; }

.answer-row {
  display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; border:1.5px solid var(--pro-border); background:white; transition:all .15s;
}
.answer-correct   { border-color:rgba(16,185,129,.4);  background:rgba(16,185,129,.04); }
.answer-incorrect { border-color:var(--pro-border); }

.ans-badge { width:26px; height:26px; border-radius:7px; flex-shrink:0; font-size:.7rem; font-weight:900; display:flex; align-items:center; justify-content:center; }
.ans-badge-correct   { background:var(--pro-green); color:white; }
.ans-badge-incorrect { background:#e8edf3; color:var(--pro-sub); }

.ans-text-area { flex:1; min-width:0; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.ans-text { font-size:.85rem; color:var(--pro-ink); font-weight:500; }
.ans-correct-label { display:inline-flex; align-items:center; gap:3px; padding:2px 7px; border-radius:100px; font-size:.68rem; font-weight:700; background:var(--pro-green-soft); color:var(--pro-green); }
.ans-incorrect-label { display:inline-flex; align-items:center; gap:3px; padding:2px 7px; border-radius:100px; font-size:.68rem; font-weight:700; background:#f1f5f9; color:var(--pro-muted); }

.ans-select-wrap { flex-shrink:0; }
.ans-select {
  padding:5px 10px; border-radius:8px; border:1.5px solid var(--pro-border); font-size:.75rem; font-weight:700; color:var(--pro-sub); background:white; cursor:pointer; outline:none; transition:border-color .15s;
  appearance:none; -webkit-appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat:no-repeat; background-position:right 6px center; background-size:14px; padding-right:26px;
}
.ans-select:focus { border-color:var(--pro-green); }
.answer-correct .ans-select { border-color:rgba(16,185,129,.4); color:var(--pro-green); background-color:rgba(16,185,129,.05); }

.ans-del-btn {
  width:26px; height:26px; border-radius:6px; flex-shrink:0; border:1.5px solid var(--pro-border); background:transparent; color:var(--pro-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0; transition:all .15s;
}
.answer-row:hover .ans-del-btn { opacity:1; }
.ans-del-btn:hover { background:var(--pro-red); color:white; border-color:var(--pro-red); }

/* Formulaire ajout réponse */
.answer-add-form { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:10px; border:2px dashed var(--pro-green); background:rgba(16,185,129,.03); }
.aaf-badge-ghost { width:26px; height:26px; border-radius:7px; flex-shrink:0; background:var(--pro-border); color:var(--pro-muted); font-size:.7rem; font-weight:900; display:flex; align-items:center; justify-content:center; }
.aaf-input { flex:1; min-width:0; padding:7px 11px; border:1.5px solid var(--pro-border); border-radius:8px; font-size:.85rem; color:var(--pro-ink); outline:none; transition:border-color .15s; background:white; }
.aaf-input:focus { border-color:var(--pro-green); }
.aaf-select {
  padding:7px 28px 7px 10px; border-radius:8px; flex-shrink:0; border:1.5px solid var(--pro-border); font-size:.78rem; font-weight:700; color:var(--pro-sub); background:white; cursor:pointer; outline:none; transition:all .15s; appearance:none; -webkit-appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat:no-repeat; background-position:right 6px center; background-size:14px;
}
.aaf-select:focus { border-color:var(--pro-green); }
.aaf-submit, .aaf-cancel { width:32px; height:32px; border-radius:8px; flex-shrink:0; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.aaf-submit { background:var(--pro-green); color:white; }
.aaf-submit:hover:not(:disabled) { background:#047857; }
.aaf-submit:disabled { opacity:.4; cursor:not-allowed; }
.aaf-cancel { background:var(--pro-bg); color:var(--pro-muted); border:1.5px solid var(--pro-border); }
.aaf-cancel:hover { background:white; color:var(--pro-red); border-color:var(--pro-red); }

/* Bouton ajouter réponse */
.add-answer-btn {
  display:inline-flex; align-items:center; gap:6px; align-self:flex-start; padding:7px 13px; border-radius:100px; border:1.5px dashed var(--pro-border); background:transparent; font-size:.78rem; font-weight:700; color:var(--pro-muted); cursor:pointer; transition:all .15s; margin-top:4px;
}
.add-answer-btn:hover { border-color:var(--pro-green); color:var(--pro-green); background:var(--pro-green-soft); }

/* Formulaire ajout question */
.question-add-form { background:white; border:2px dashed var(--pro-border); border-radius:var(--pro-r-lg); padding:14px 16px; transition:border-color .15s; }
.question-add-form:focus-within { border-color:var(--pro-green); }
.qaf-header { display:flex; align-items:center; gap:10px; }
.qaf-input { flex:1; min-width:0; padding:10px 14px; border:1.5px solid var(--pro-border); border-radius:var(--pro-r-md); font-size:.9rem; color:var(--pro-ink); outline:none; transition:border-color .15s; background:white; }
.qaf-input:focus { border-color:var(--pro-green); box-shadow:0 0 0 3px rgba(16,185,129,.1); }

/* Bouton ajouter question */
.add-question-btn {
  display:flex; align-items:center; justify-content:center; gap:10px; padding:16px; border-radius:var(--pro-r-lg); border:2px dashed var(--pro-border); background:transparent; font-size:.9rem; font-weight:700; color:var(--pro-muted); cursor:pointer; transition:all .2s; width:100%;
}
.add-question-btn:hover { border-color:var(--pro-green); color:var(--pro-green); background:rgba(16,185,129,.03); }

.empty-questions { display:flex; flex-direction:column; align-items:center; gap:8px; padding:40px 20px; text-align:center; }
.pro-empty-icon { opacity: 0.5; }

/* ── Badge temps réel ───────────────────────────── */
.realtime-badge {
  display:inline-flex; align-items:center; gap:7px; padding:7px 14px; border-radius:100px; background:rgba(16,185,129,.08); border:1.5px solid rgba(16,185,129,.2); font-size:.78rem; font-weight:700; color:var(--pro-green); flex-shrink:0;
}
.rt-dot {
  width:8px; height:8px; border-radius:50%; background:var(--pro-green); flex-shrink:0;
  animation:rtpulse 1.4s ease-in-out infinite;
}
@keyframes rtpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.75)} }
.rt-timer { font-size:.7rem; color:var(--pro-muted); }

/* ── Stats cards ────────────────────────────────── */
.stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
@media(max-width:640px) { .stats-grid { grid-template-columns:repeat(2,1fr); } }
.stat-card {
  padding:16px 18px; border-radius:var(--pro-r-lg); display:flex; flex-direction:column; gap:6px;
  border:1.5px solid var(--pro-border); background:white; position:relative; overflow:hidden;
}
.stat-card::before { content:''; position:absolute; top:-20px; right:-20px; width:70px; height:70px; border-radius:50%; opacity:.07; }
.stat-blue   { --sc:var(--pro-blue);   } .stat-blue::before   { background:var(--pro-blue);   }
.stat-amber  { --sc:var(--pro-amber);  } .stat-amber::before  { background:var(--pro-amber);  }
.stat-green  { --sc:var(--pro-green);  } .stat-green::before  { background:var(--pro-green);  }
.stat-violet { --sc:var(--pro-violet); } .stat-violet::before { background:var(--pro-violet); }
.stat-icon { width:34px; height:34px; border-radius:9px; background:color-mix(in srgb, var(--sc) 12%, white); color:var(--sc); display:flex; align-items:center; justify-content:center; }
.stat-val   { font-size:1.7rem; font-weight:900; color:var(--pro-ink); line-height:1; }
.stat-label { font-size:.72rem; color:var(--pro-muted); text-transform:uppercase; letter-spacing:.06em; font-weight:700; }

/* ── Tableau résultats ──────────────────────────── */
.results-card { overflow:hidden; }
.results-header { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:14px 20px; border-bottom:1px solid var(--pro-border); }
.results-title { display:flex; align-items:center; gap:8px; font-size:.9rem; font-weight:800; color:var(--pro-ink); margin:0; }
.filter-tab {
  padding: 5px 12px; border-radius: 100px; border: 1px solid var(--pro-border); background: white; font-size: 0.75rem; font-weight: 600; color: var(--pro-sub); cursor: pointer; transition: all 0.2s;
}
.filter-tab:hover  { border-color: var(--pro-green); color: var(--pro-green); background: var(--pro-green-soft); }
.filter-tab-active { background: var(--pro-green); border-color: var(--pro-green); color: white; }

.results-table { width:100%; border-collapse:collapse; }
.results-table th { padding:9px 16px; font-size:.7rem; font-weight:800; color:var(--pro-muted); text-transform:uppercase; letter-spacing:.06em; background:#f8fafc; border-bottom:1px solid var(--pro-border); text-align:left; }
.results-table td { padding:10px 16px; border-bottom:1px solid var(--pro-border); font-size:.84rem; vertical-align:middle; }
.results-table tr:last-child td { border-bottom:none; }
.row-pending { opacity:.6; }
.student-cell { display:flex; align-items:center; gap:9px; font-weight: 600; color: var(--pro-ink);}
.student-av { width:28px; height:28px; border-radius:50%; flex-shrink:0; background:var(--pro-blue-soft); color:var(--pro-blue); font-size:.75rem; font-weight:900; display:flex; align-items:center; justify-content:center; }
.score-bar-wrap { display:flex; align-items:center; gap:8px; }
.score-track { flex:1; height:6px; border-radius:3px; background:var(--pro-border); overflow:hidden; }
.score-fill  { height:100%; border-radius:3px; transition:width .6s ease; }
.score-pct   { font-size:.8rem; font-weight:800; width:36px; text-align:right; flex-shrink:0; }
.score-frac  { white-space:nowrap; }
.status-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:100px; font-size:.7rem; font-weight:700; }
.sb-done    { background:var(--pro-green-soft); color:var(--pro-green); }
.sb-pending { background:var(--pro-amber-soft); color:var(--pro-amber); }
.pro-empty { text-align: center; color: var(--pro-muted); }

/* ── Distribution ───────────────────────────────── */
.dist-chart { display:flex; align-items:flex-end; justify-content:space-around; gap:8px; padding:16px 20px 14px; height:130px; }
.dist-col { display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; }
.dist-bar-wrap { flex:1; display:flex; align-items:flex-end; width:100%; }
.dist-bar { width:100%; border-radius:5px 5px 0 0; min-height:4px; display:flex; align-items:flex-start; justify-content:center; transition:height .4s ease; }
.dist-count { font-size:.7rem; font-weight:900; color:white; padding-top:4px; }
.dist-label { font-size:.65rem; font-weight:700; color:var(--pro-muted); white-space:nowrap; }
</style>