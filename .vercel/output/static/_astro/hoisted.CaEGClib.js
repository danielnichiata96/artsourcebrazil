document.addEventListener("DOMContentLoaded",()=>{const e=localStorage.getItem("job_draft");if(!e){window.location.href="/post-a-job";return}try{const t=JSON.parse(e);c(t)}catch(t){console.error("Failed to load draft:",t),window.location.href="/post-a-job"}document.getElementById("publish-btn")?.addEventListener("click",()=>{alert(`Integração com Stripe em desenvolvimento!

Em breve você poderá:
1. Salvar rascunho no Supabase
2. Redirecionar para pagamento Stripe
3. Receber confirmação por email`)})});function c(e){const t=document.getElementById("job-preview-container");if(!t)return;const a={jobTitle:e.draft_data.title||"Título da Vaga",companyName:e.company_name||"Nome da Empresa",category:e.draft_data.category||"Game Dev",location:{scope:e.draft_data.location_scope||"remote-brazil",text:e.draft_data.location_text||l(e.draft_data.location_scope)},description:e.draft_data.description||"",tags:s(e.draft_data.description||""),postedDate:new Date().toISOString(),applicationUrl:e.draft_data.application_url||"#",companyLogo:e.draft_data.company_logo_url||null,salary:e.draft_data.salary_min||e.draft_data.salary_max?{min:e.draft_data.salary_min||null,max:e.draft_data.salary_max||null,currency:e.draft_data.salary_currency||"USD"}:null,contractType:e.draft_data.contract_type||null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},o="PUBLICADO AGORA",n={"Game Dev":"bg-accent-teal","3D":"bg-accent-purple","2D Art":"bg-accent-pink",Animation:"bg-accent-orange",Design:"bg-accent-lime",VFX:"bg-accent-teal"}[a.category]||"bg-accent-lime",r=a.companyLogo||"/images/company-placeholder.svg";t.innerHTML=`
      <article class="job-card group relative flex flex-col md:flex-row border-2 border-ink bg-white p-0 shadow-hard">
        <div class="${n} w-full md:w-4 border-b-2 md:border-b-0 md:border-r-2 border-ink h-4 md:h-auto flex-shrink-0"></div>
        <div class="flex-1 flex flex-col md:flex-row">
          <div class="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-4 mb-3">
                <div class="flex items-center gap-4">
                  <div class="h-14 w-14 border-2 border-ink bg-white shadow-hard-sm flex items-center justify-center">
                    <img src="${r}" alt="${a.companyName} logo" loading="lazy" class="h-12 w-12 object-contain" />
                  </div>
                  <div>
                    <h3 class="font-display text-xl font-bold leading-tight">${a.jobTitle}</h3>
                    <p class="text-base font-medium text-stone-500 mt-1">${a.companyName}</p>
                  </div>
                </div>
                <span class="border-2 border-ink bg-accent-lime px-2 py-0.5 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000]">New</span>
              </div>
              <div class="flex flex-wrap gap-3 mt-4 text-xs font-bold uppercase tracking-wider text-stone-500">
                <span class="flex items-center gap-1 text-ink">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  ${a.location.text}
                </span>
                ${a.contractType?`
                  <span class="flex items-center gap-1 text-ink">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    ${a.contractType}
                  </span>
                `:""}
                ${a.salary?`<span class="text-emerald-700 bg-emerald-100 px-1 border border-emerald-200">${d(a.salary)}</span>`:""}
              </div>
            </div>
            <div class="mt-6 flex flex-wrap gap-2 relative z-10">
              ${a.tags.map(i=>`<span class="border border-ink bg-white px-2 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#e5e5e5] hover:bg-ink hover:text-white transition-colors">${i}</span>`).join("")}
            </div>
          </div>
          <div class="p-6 pt-0 md:pt-6 md:border-l-2 md:border-ink flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 bg-stone-50 md:bg-transparent">
            <time class="text-xs font-bold text-stone-400 uppercase tracking-widest">${o}</time>
            <div class="hidden md:flex w-10 h-10 border-2 border-ink rounded-full items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
          </div>
        </div>
      </article>
    `}function l(e){return{"remote-brazil":"Remoto (Brasil)","remote-worldwide":"Remoto (Global)",hybrid:"Híbrido",onsite:"Presencial"}[e]||"Remoto"}function s(e){return["Unity","Unreal","Blender","Maya","C#","C++","Python","React","Vue","Angular","3D","2D","VFX","Animation"].filter(a=>e.toLowerCase().includes(a.toLowerCase())).slice(0,6)}function d(e){const t=e.currency==="BRL"?"R$":e.currency==="EUR"?"€":"$";return e.min&&e.max?`${t}${e.min.toLocaleString()} - ${t}${e.max.toLocaleString()}`:e.min?`A partir de ${t}${e.min.toLocaleString()}`:e.max?`Até ${t}${e.max.toLocaleString()}`:""}
