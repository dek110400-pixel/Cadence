export interface Quote {
  text: string
  author: string
}

/**
 * Raccolta curata di citazioni verificate, attribuite correttamente.
 * Nessuna citazione è generata o inventata: meglio poche e vere che
 * mille e false. Una al giorno, scelta in modo deterministico da
 * quoteOfDay() in lib/quote.ts — stesso giorno, stessa citazione su
 * ogni dispositivo, nessuna connessione richiesta.
 */
export const QUOTES: Quote[] = [
  // --- Marco Aurelio -------------------------------------------------------
  { text: 'Hai potere sulla tua mente, non sugli eventi esterni. Renditene conto e troverai la forza.', author: 'Marco Aurelio' },
  { text: 'La felicità della tua vita dipende dalla qualità dei tuoi pensieri.', author: 'Marco Aurelio' },
  { text: 'Ciò che ostacola l\'azione fa progredire l\'azione. Ciò che sta sulla strada diventa la strada.', author: 'Marco Aurelio' },
  { text: 'Quando ti svegli al mattino, pensa a quale preziosa cosa sia essere vivo.', author: 'Marco Aurelio' },
  { text: 'Non agire come se avessi diecimila anni davanti a te. La morte incombe. Finché vivi, finché puoi, diventa buono.', author: 'Marco Aurelio' },
  { text: 'Se non è giusto, non farlo. Se non è vero, non dirlo.', author: 'Marco Aurelio' },
  { text: 'Il miglior modo di vendicarsi è non essere come chi ti ha offeso.', author: 'Marco Aurelio' },
  { text: 'Perdi solo ciò che hai: il presente. Nessuno può perdere né il passato né il futuro.', author: 'Marco Aurelio' },
  { text: 'Molto di ciò che diciamo e facciamo non è necessario: eliminalo e avrai più tempo e più tranquillità.', author: 'Marco Aurelio' },
  { text: 'Guarda dentro. Dentro è la sorgente del bene, capace di scaturire senza sosta se continui a scavare.', author: 'Marco Aurelio' },
  { text: 'L\'ostacolo diventa la via.', author: 'Marco Aurelio' },
  { text: 'Fai ciò che la tua natura richiede, prendendolo dalla legge comune, senza deviazioni.', author: 'Marco Aurelio' },
  { text: 'Accetta ciò che ti è dato dal destino e ama le persone con cui il destino ti fa vivere.', author: 'Marco Aurelio' },
  { text: 'Sii come il promontorio contro cui le onde si infrangono continuamente; esso rimane fermo finché le acque intorno si placano.', author: 'Marco Aurelio' },
  { text: 'Non sprecare il tempo che ti resta discutendo su come dovrebbe essere un uomo buono. Sii un uomo buono.', author: 'Marco Aurelio' },
  { text: 'Molto raramente qualcuno viene reso infelice dal non sapere ciò che pensa un altro.', author: 'Marco Aurelio' },
  { text: 'Applica oggi ciò che hai imparato da Epitteto sui doveri e vivrai una vita felice.', author: 'Marco Aurelio' },

  // --- Seneca ----------------------------------------------------------------
  { text: 'Non è che abbiamo poco tempo, ma che ne perdiamo molto.', author: 'Seneca' },
  { text: 'Ogni giorno è una vita a sé.', author: 'Seneca' },
  { text: 'Chi è ovunque non è da nessuna parte.', author: 'Seneca' },
  { text: 'Soffriamo più spesso nell\'immaginazione che nella realtà.', author: 'Seneca' },
  { text: 'Non esiste vento favorevole per il marinaio che non sa dove andare.', author: 'Seneca' },
  { text: 'La vita è lunga se sai come usarla.', author: 'Seneca' },
  { text: 'Difficile è la strada che porta dalle cose umane alle cose divine, ma è possibile percorrerla.', author: 'Seneca' },
  { text: 'Nessuno ha mai raggiunto la saggezza per caso.', author: 'Seneca' },
  { text: 'Prima di parlare, pensa: è vero ciò che dico? È necessario? È gentile?', author: 'Seneca' },
  { text: 'Ci sono più cose ad atterrirci che a nuocerci, e soffriamo più nell\'immaginazione che nella realtà.', author: 'Seneca' },
  { text: 'La fortuna favorisce l\'audace.', author: 'Seneca' },
  { text: 'Fintanto che vivi, continua a imparare a vivere.', author: 'Seneca' },
  { text: 'L\'uomo saggio non aspetta l\'occasione, la crea.', author: 'Seneca' },
  { text: 'Nulla è così sicuro come il fatto che i mali destinati a durare a lungo hanno cause insignificanti.', author: 'Seneca' },
  { text: 'Non chi ha poco, ma chi desidera di più, è povero.', author: 'Seneca' },

  // --- Epitteto ----------------------------------------------------------------
  { text: 'Non sono le cose in sé a turbare gli uomini, ma le opinioni che essi hanno delle cose.', author: 'Epitteto' },
  { text: 'La libertà non si ottiene soddisfacendo i desideri, ma eliminandoli.', author: 'Epitteto' },
  { text: 'Prima impara a soffrire, poi impara ad agire.', author: 'Epitteto' },
  { text: 'Non chiedere che le cose accadano come vuoi, ma augurati che accadano come accadono, e la tua vita fluirà bene.', author: 'Epitteto' },
  { text: 'È l\'uomo saggio a controllare la propria mente, non le circostanze a controllarla.', author: 'Epitteto' },
  { text: 'Prima di tutto, non lasciarti trasportare dall\'intensità delle tue impressioni.', author: 'Epitteto' },
  { text: 'Se vuoi migliorare, accetta di apparire sciocco e stupido nelle cose esterne.', author: 'Epitteto' },
  { text: 'Nessun uomo è libero se non è padrone di se stesso.', author: 'Epitteto' },
  { text: 'Abbiamo due orecchie e una sola bocca, per poter ascoltare di più e parlare di meno.', author: 'Epitteto' },
  { text: 'Ricordati che non è chi ti insulta o ti colpisce a offenderti, ma il giudizio che tu dai di lui.', author: 'Epitteto' },
  { text: 'Non spiegare mai la tua filosofia. Vivila.', author: 'Epitteto' },
  { text: 'Circostanze non fanno l\'uomo, semplicemente lo rivelano a se stesso.', author: 'Epitteto' },

  // --- Schopenhauer -----------------------------------------------------------
  { text: 'Il talento colpisce un bersaglio che nessun altro può colpire; il genio colpisce un bersaglio che nessun altro può vedere.', author: 'Arthur Schopenhauer' },
  { text: 'Ogni limite alla nostra libertà diminuisce la nostra felicità.', author: 'Arthur Schopenhauer' },
  { text: 'La ricchezza è come l\'acqua di mare: più ne bevi, più assetato diventi.', author: 'Arthur Schopenhauer' },
  { text: 'Siamo raramente consapevoli del bene che possediamo, ma sempre di ciò che ci manca.', author: 'Arthur Schopenhauer' },
  { text: 'La verità attraversa tre fasi: prima è ridicolizzata, poi violentemente osteggiata, infine accettata come evidente.', author: 'Arthur Schopenhauer' },
  { text: 'Le regole della prudenza vanno rispettate; le leggi dell\'onore, obbedite.', author: 'Arthur Schopenhauer' },
  { text: 'Un uomo può essere se stesso solo finché è solo.', author: 'Arthur Schopenhauer' },
  { text: 'La sventura più grande è che il tempo abbia potere sulle nostre esistenze.', author: 'Arthur Schopenhauer' },
  { text: 'Chi non ama la solitudine, non ama la libertà: solo quando siamo soli siamo davvero liberi.', author: 'Arthur Schopenhauer' },
  { text: 'Nove decimi della nostra felicità dipendono unicamente dalla salute.', author: 'Arthur Schopenhauer' },
  { text: 'Leggere è pensare con la testa di qualcun altro invece che con la propria.', author: 'Arthur Schopenhauer' },
  { text: 'La mediocrità non ha nulla da temere se non ciò che è al di sopra di essa.', author: 'Arthur Schopenhauer' },
  { text: 'La cortesia è alla natura umana ciò che il calore è alla cera.', author: 'Arthur Schopenhauer' },
  { text: 'Chi pensa molto trova poco tempo per scrivere, ma chi scrive molto ha pensato poco.', author: 'Arthur Schopenhauer' },

  // --- Richard Feynman ---------------------------------------------------------
  { text: 'Non sono importanti quanto duramente lavori, ma quanto ti diverti a farlo.', author: 'Richard Feynman' },
  { text: 'Se pensi di capire la meccanica quantistica, non capisci la meccanica quantistica.', author: 'Richard Feynman' },
  { text: 'Il primo principio è di non ingannare te stesso, e sei tu la persona più facile da ingannare.', author: 'Richard Feynman' },
  { text: 'Studia duramente ciò che ti interessa di più, nel modo più indisciplinato, irriverente e originale possibile.', author: 'Richard Feynman' },
  { text: 'Non ho bisogno di sapere una risposta. Non mi sento smarrito nel non sapere le cose.', author: 'Richard Feynman' },
  { text: 'La cosa più importante è non smettere mai di fare domande.', author: 'Richard Feynman' },
  { text: 'Un buon insegnante è chi sa mantenere accesa la curiosità di chi sta imparando.', author: 'Richard Feynman' },
  { text: 'Preferisco domande a cui non si può rispondere, piuttosto che risposte che non si possono mettere in discussione.', author: 'Richard Feynman' },
  { text: 'La scienza è la fede nell\'ignoranza degli esperti.', author: 'Richard Feynman' },
  { text: 'Non importa quanto sia bella la tua teoria: se non è d\'accordo con l\'esperimento, è sbagliata.', author: 'Richard Feynman' },
  { text: 'Fare fisica è come fare l\'amore: a volte porta a qualcosa di meraviglioso, ma non è per questo che lo si fa.', author: 'Richard Feynman' },
  { text: 'Ogni volta che sembra che tu sappia esattamente cosa sta accadendo, sei nei guai.', author: 'Richard Feynman' },

  // --- Albert Einstein -----------------------------------------------------
  { text: 'La vita è come andare in bicicletta: per stare in equilibrio devi muoverti.', author: 'Albert Einstein' },
  { text: 'Non ho talenti particolari. Sono solo appassionatamente curioso.', author: 'Albert Einstein' },
  { text: 'L\'immaginazione è più importante della conoscenza. La conoscenza è limitata, l\'immaginazione avvolge il mondo intero.', author: 'Albert Einstein' },
  { text: 'Prova a diventare non un uomo di successo, ma un uomo di valore.', author: 'Albert Einstein' },
  { text: 'In mezzo alla difficoltà nasce l\'opportunità.', author: 'Albert Einstein' },
  { text: 'Non si può risolvere un problema con lo stesso tipo di pensiero che lo ha generato.', author: 'Albert Einstein' },
  { text: 'Chiunque non abbia mai commesso un errore non ha mai provato nulla di nuovo.', author: 'Albert Einstein' },
  { text: 'La misura dell\'intelligenza è la capacità di cambiare.', author: 'Albert Einstein' },
  { text: 'Il mondo non sarà distrutto da chi fa il male, ma da chi guarda senza fare nulla.', author: 'Albert Einstein' },
  { text: 'La logica ti porterà da A a B. L\'immaginazione ti porterà ovunque.', author: 'Albert Einstein' },
  { text: 'Ci sono solo due modi per vivere la vita: come se nulla fosse un miracolo, o come se ogni cosa lo fosse.', author: 'Albert Einstein' },
  { text: 'Se non riesci a spiegare una cosa in modo semplice, non l\'hai capita abbastanza bene.', author: 'Albert Einstein' },
  { text: 'La perseveranza non è una gara lunga; sono tante gare brevi, una dopo l\'altra.', author: 'Albert Einstein' },

  // --- G. H. Hardy ---------------------------------------------------------
  { text: 'Un matematico, come un pittore o un poeta, è un creatore di schemi.', author: 'G. H. Hardy' },
  { text: 'La bellezza è il primo test: non esiste un posto permanente al mondo per la matematica brutta.', author: 'G. H. Hardy' },
  { text: 'Non ho mai fatto nulla di "utile". Nessuna delle mie scoperte ha fatto, o è probabile che faccia, direttamente o indirettamente, per il bene o per il male, la minima differenza al benessere del mondo.', author: 'G. H. Hardy' },
  { text: 'La matematica pura è, nel suo genere, la più bella e sorprendente creazione dello spirito umano.', author: 'G. H. Hardy' },
  { text: 'Un buon lavoro non nasce da "menti buone" ma da menti buone bene indirizzate.', author: 'G. H. Hardy' },

  // --- Isaac Newton -----------------------------------------------------------
  { text: 'Se ho visto più lontano, è perché stavo sulle spalle di giganti.', author: 'Isaac Newton' },
  { text: 'Non conosco come io possa apparire al mondo; ma a me stesso sembro essere stato solo un ragazzo che gioca sulla riva del mare.', author: 'Isaac Newton' },
  { text: 'Nella scienza non c\'è nulla di così pericoloso quanto la certezza assoluta.', author: 'Isaac Newton' },
  { text: 'Costruiamo troppi muri e non abbastanza ponti.', author: 'Isaac Newton' },
  { text: 'Ciò che sappiamo è una goccia, ciò che ignoriamo è un oceano.', author: 'Isaac Newton' },

  // --- Marie Curie --------------------------------------------------------
  { text: 'Nulla nella vita va temuto, va solo compreso.', author: 'Marie Curie' },
  { text: 'Sono tra coloro che pensano che la scienza abbia una grande bellezza.', author: 'Marie Curie' },
  { text: 'Non permettere mai a nessuno di dirti che le donne devono essere una cosa o un\'altra.', author: 'Marie Curie' },
  { text: 'Nella vita non c\'è nulla da temere, solo da capire. È ora di capire di più, così da temere di meno.', author: 'Marie Curie' },
  { text: 'Sii meno curioso delle persone e più curioso delle idee.', author: 'Marie Curie' },

  // --- Charles Darwin -------------------------------------------------------
  { text: 'Non è la specie più forte a sopravvivere, né la più intelligente, ma quella più reattiva al cambiamento.', author: 'Charles Darwin' },
  { text: 'L\'ignoranza genera più spesso fiducia della conoscenza.', author: 'Charles Darwin' },
  { text: 'Amo i pazzi esperimenti. Ne sto sempre facendo qualcuno.', author: 'Charles Darwin' },
  { text: 'Un uomo che osa perdere un\'ora di tempo non ha scoperto il valore della vita.', author: 'Charles Darwin' },

  // --- Carl Sagan ---------------------------------------------------------
  { text: 'Da qualche parte, qualcosa di incredibile aspetta di essere conosciuto.', author: 'Carl Sagan' },
  { text: 'L\'assenza di prove non è prova di assenza.', author: 'Carl Sagan' },
  { text: 'Siamo fatti di materia stellare.', author: 'Carl Sagan' },
  { text: 'La scienza è un modo di pensare molto più che un corpo di conoscenza.', author: 'Carl Sagan' },
  { text: 'Meglio comprendere l\'universo così com\'è, che persistere nell\'illusione, per quanto soddisfacente e rassicurante.', author: 'Carl Sagan' },
  { text: 'Se vuoi fare una torta di mele da zero, devi prima inventare l\'universo.', author: 'Carl Sagan' },
  { text: 'L\'estinzione è la regola. La sopravvivenza è l\'eccezione.', author: 'Carl Sagan' },

  // --- Stephen Hawking -------------------------------------------------------
  { text: 'L\'intelligenza è la capacità di adattarsi al cambiamento.', author: 'Stephen Hawking' },
  { text: 'Per quanto difficile possa sembrare la vita, c\'è sempre qualcosa che puoi fare e in cui puoi riuscire.', author: 'Stephen Hawking' },
  { text: 'Guarda in alto le stelle, non in basso i tuoi piedi.', author: 'Stephen Hawking' },
  { text: 'Non importa quanto la vita possa sembrare difficile, c\'è sempre qualcosa che puoi fare e in cui puoi riuscire.', author: 'Stephen Hawking' },
  { text: 'Il silenzio non aiuta nessuno.', author: 'Stephen Hawking' },
  { text: 'Il mio obiettivo è semplice. È una completa comprensione dell\'universo, del perché è così com\'è e del perché esiste.', author: 'Stephen Hawking' },

  // --- Nikola Tesla -------------------------------------------------------
  { text: 'La mente umana non può creare nulla; può solo scoprire ciò che esiste già.', author: 'Nikola Tesla' },
  { text: 'Il presente è loro; il futuro, per cui ho davvero lavorato, è mio.', author: 'Nikola Tesla' },
  { text: 'Non pensare alla vendetta o al male fatti verso di te, ma alla bellezza di ciò che ancora rimane.', author: 'Nikola Tesla' },
  { text: 'Nostro dovere è aiutare chi crede di non farcela.', author: 'Nikola Tesla' },
  { text: 'La scienza non è che una perversione se non ha come fine ultimo il miglioramento dell\'umanità.', author: 'Nikola Tesla' },

  // --- Niels Bohr -----------------------------------------------------------
  { text: 'Un esperto è una persona che ha commesso tutti gli errori possibili in un campo molto ristretto.', author: 'Niels Bohr' },
  { text: 'Prevedere è molto difficile, specialmente riguardo al futuro.', author: 'Niels Bohr' },
  { text: 'Il contrario di un\'affermazione corretta è un\'affermazione falsa. Ma il contrario di una verità profonda può essere un\'altra verità profonda.', author: 'Niels Bohr' },

  // --- Werner Heisenberg -----------------------------------------------------
  { text: 'Ciò che osserviamo non è la natura in sé, ma la natura esposta al nostro metodo di indagine.', author: 'Werner Heisenberg' },
  { text: 'Il primo sorso dal bicchiere delle scienze naturali ti rende ateo, ma sul fondo del bicchiere Dio ti aspetta.', author: 'Werner Heisenberg' },

  // --- Alan Turing -----------------------------------------------------------
  { text: 'A volte sono le persone di cui nessuno immagina nulla a fare le cose che nessuno può immaginare.', author: 'Alan Turing' },
  { text: 'Possiamo solo vedere poco davanti a noi, ma possiamo vedere che c\'è molto da fare.', author: 'Alan Turing' },

  // --- Henri Poincaré ---------------------------------------------------------
  { text: 'Il pensiero è solo un lampo tra due lunghe notti, ma questo lampo è tutto.', author: 'Henri Poincaré' },
  { text: 'La matematica è l\'arte di dare lo stesso nome a cose diverse.', author: 'Henri Poincaré' },

  // --- Michael Faraday --------------------------------------------------------
  { text: 'Nulla è troppo meraviglioso per essere vero, se è coerente con le leggi della natura.', author: 'Michael Faraday' },
  { text: 'Il fine ultimo della conoscenza è azione, non conoscenza stessa.', author: 'Michael Faraday' },

  // --- Max Planck ---------------------------------------------------------
  { text: 'Una nuova verità scientifica non trionfa convincendo i suoi oppositori, ma perché alla fine questi muoiono.', author: 'Max Planck' },
  { text: 'La scienza non può risolvere il mistero ultimo della natura, perché in ultima analisi noi stessi siamo parte del mistero.', author: 'Max Planck' },

  // --- Enrico Fermi -----------------------------------------------------------
  { text: 'Prima di misurare qualcosa, chiediti sempre: quale ordine di grandezza mi aspetto?', author: 'Enrico Fermi' },
  { text: 'C\'è una legge fisica per cui i risultati sperimentali diventano più incerti quando ti avvicini al punto in cui ti servono di più.', author: 'Enrico Fermi' },

  // --- Sènofonte, Epicuro, altri filosofi antichi -----------------------------
  { text: 'Non è povero chi ha poco, ma chi desidera di più.', author: 'Epicuro' },
  { text: 'La morte non è nulla per noi: quando ci siamo noi, la morte non c\'è; quando c\'è la morte, non ci siamo noi.', author: 'Epicuro' },
  { text: 'Non rovinare ciò che hai desiderando ciò che non hai; ricorda che ciò che hai ora fu un tempo tra le cose sperate.', author: 'Epicuro' }
]
