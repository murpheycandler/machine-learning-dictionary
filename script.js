class MLDictionary {
    constructor() {
        this.terms = [];
        this.currentSort = 'alphabetical';
        this.searchQuery = '';
        this.editingId = null;
        
        this.init();
    }

    init() {
        this.loadTerms();
        this.setupEventListeners();
        this.render();
    }

    loadTerms() {
        const saved = localStorage.getItem('mlDictionary');
        if (saved) {
            this.terms = JSON.parse(saved);
        } else {
            // Add some sample terms
            this.terms = [
                {
                    id: '1',
                    term: 'Neural Network',
                    definition: 'A computing system inspired by biological neural networks that constitute animal brains. Such systems learn to perform tasks by considering examples, generally without being programmed with task-specific rules.',
                    dateAdded: new Date('2024-01-01').toISOString(),
                    dateModified: new Date('2024-01-01').toISOString()
                },
                {
                    id: '2',
                    term: 'Gradient Descent',
                    definition: 'An optimization algorithm used to minimize some function by iteratively moving in the direction of steepest descent as defined by the negative of the gradient.',
                    dateAdded: new Date('2024-01-02').toISOString(),
                    dateModified: new Date('2024-01-02').toISOString()
                },
                {
                    id: '3',
                    term: 'Overfitting',
                    definition: 'A modeling error in statistics that occurs when a function is too closely aligned to a limited set of data points. The model learns the detail and noise in the training data to the extent that it negatively impacts the performance on new data.',
                    dateAdded: new Date('2024-01-03').toISOString(),
                    dateModified: new Date('2024-01-03').toISOString()
                }
            ];
            this.saveTerms();
        }
    }

    saveTerms() {
        localStorage.setItem('mlDictionary', JSON.stringify(this.terms));
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('termForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Cancel edit
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        // Clear search
        document.getElementById('clearSearch').addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            this.searchQuery = '';
            this.render();
        });

        // Sort
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });
    }

    handleSubmit() {
        const termInput = document.getElementById('termInput');
        const definitionInput = document.getElementById('definitionInput');
        
        const term = termInput.value.trim();
        const definition = definitionInput.value.trim();
        
        if (!term || !definition) return;

        if (this.editingId) {
            // Update existing term
            const index = this.terms.findIndex(t => t.id === this.editingId);
            if (index !== -1) {
                this.terms[index] = {
                    ...this.terms[index],
                    term,
                    definition,
                    dateModified: new Date().toISOString()
                };
            }
        } else {
            // Add new term
            const newTerm = {
                id: Date.now().toString(),
                term,
                definition,
                dateAdded: new Date().toISOString(),
                dateModified: new Date().toISOString()
            };
            this.terms.push(newTerm);
        }

        this.saveTerms();
        this.cancelEdit();
        this.render();
    }

    editTerm(id) {
        const term = this.terms.find(t => t.id === id);
        if (term) {
            this.editingId = id;
            document.getElementById('editingId').value = id;
            document.getElementById('termInput').value = term.term;
            document.getElementById('definitionInput').value = term.definition;
            document.getElementById('submitBtn').textContent = 'Update Term';
            document.getElementById('cancelBtn').style.display = 'inline-block';
            
            // Scroll to form
            document.querySelector('.add-term-section').scrollIntoView({ behavior: 'smooth' });
        }
    }

    deleteTerm(id) {
        if (confirm('Are you sure you want to delete this term?')) {
            this.terms = this.terms.filter(t => t.id !== id);
            this.saveTerms();
            
            if (this.editingId === id) {
                this.cancelEdit();
            }
            
            this.render();
        }
    }

    cancelEdit() {
        this.editingId = null;
        document.getElementById('editingId').value = '';
        document.getElementById('termInput').value = '';
        document.getElementById('definitionInput').value = '';
        document.getElementById('submitBtn').textContent = 'Add Term';
        document.getElementById('cancelBtn').style.display = 'none';
    }

    getSortedTerms() {
        let filtered = this.terms.filter(term => 
            this.searchQuery === '' || 
            term.term.toLowerCase().includes(this.searchQuery) ||
            term.definition.toLowerCase().includes(this.searchQuery)
        );

        switch (this.currentSort) {
            case 'alphabetical':
                return filtered.sort((a, b) => a.term.localeCompare(b.term));
            case 'alphabetical-reverse':
                return filtered.sort((a, b) => b.term.localeCompare(a.term));
            case 'date-added':
                return filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            case 'date-added-oldest':
                return filtered.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
            case 'date-modified':
                return filtered.sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified));
            default:
                return filtered;
        }
    }

    highlightText(text) {
        if (!this.searchQuery) return text;
        
        const regex = new RegExp(`(${this.searchQuery})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    render() {
        const sortedTerms = this.getSortedTerms();
        const dictionaryList = document.getElementById('dictionaryList');
        const entryCount = document.getElementById('entryCount');
        
        entryCount.textContent = sortedTerms.length;

        if (sortedTerms.length === 0) {
            dictionaryList.innerHTML = `
                <div class="empty-state">
                    <p>📚 No terms found</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">
                        ${this.searchQuery ? 'Try a different search term' : 'Add your first ML term above!'}
                    </p>
                </div>
            `;
            return;
        }

        dictionaryList.innerHTML = sortedTerms.map(term => `
            <div class="term-card">
                <div class="term-header">
                    <div class="term-title">${this.highlightText(term.term)}</div>
                    <div class="term-actions">
                        <button class="btn-icon" onclick="dictionary.editTerm('${term.id}')" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-icon btn-delete" onclick="dictionary.deleteTerm('${term.id}')" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="term-definition">${this.highlightText(term.definition)}</div>
                <div class="term-meta">
                    <span>Added: ${this.formatDate(term.dateAdded)}</span>
                    ${term.dateModified !== term.dateAdded ? 
                        `<span>Modified: ${this.formatDate(term.dateModified)}</span>` : ''}
                </div>
            </div>
        `).join('');
    }
}

// Initialize the dictionary
const dictionary = new MLDictionary();