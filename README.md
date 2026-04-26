# AlphaFold Fusion (AFF) v4.1

**Physics-Based Protein Structure Interpretation and Simulation-Ready Exports**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://alphafold-fusion.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Publication

> **AlphaFold Fusion: Two Interfaces for Protein-Structure Interpretation 
> and Simulation-Ready Exports**
>
> Charfeddine Gharsallah, Thomas Cokelaer, Hervé Lecoeur, Eric Prina, 
> Gerald F. Späth
>
> Institut Pasteur, Université Paris Cité, INSERM U1347

## Web Application

🌐 **Live:** [https://alphafold-fusion.vercel.app](https://alphafold-fusion.vercel.app)

### Features
- 3D protein structure visualization (3Dmol.js)
- pLDDT/PAE confidence analysis
- UniProt & InterPro annotation overlays
- PAE-derived domain decomposition
- MSA search via ColabFold API
- ESMFold chunked mode (up to 2500 aa)
- MD Lab: OpenMM script generation with IDR-aware restraints
- Publication-ready PNG export (300/600 DPI)
- Multi-protein session support

### Supported Input
- UniProt accessions (e.g., P68871, Q9UKV8)
- MGYP IDs from ESM Metagenomic Atlas
- Raw FASTA sequences (auto-chunked if >400 aa)

## Colab/Streamlit Environment

📓 **Notebook:** [Google Colab link]

### Features
- ColabFold prediction (monomers & multimers)
- AFDB-first retrieval mode
- Spectral clustering PAE domain decomposition
- Multi-model comparison
- MSA loading (automatic A3M + manual paste)
- GFF3 export of disordered regions
- Inter-chain contact analysis (multimers)

## Quick Start (Web)

1. Visit [https://alphafold-fusion-6demeeil3-charfe346s-projects.vercel.app/]
2. Click any protein in **Quick Start** (e.g., Hemoglobin β)
3. Explore Dashboard → Quality → Viewer → MD Lab → Deep Analysis

## Local Development

```bash
git clone https://github.com/Charfe346/alphafold-fusion-AFF-.git
cd alphafold-fusion-AFF-
npm install
npm run dev
