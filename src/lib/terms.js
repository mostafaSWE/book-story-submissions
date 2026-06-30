// Terms & Conditions content for the story-submission project.
// `ar` is the authoritative source supplied by the publisher; the other
// languages are faithful legal translations (machine-drafted, then reviewed
// clause-by-clause against the Arabic for completeness and legal fidelity).
// Each entry holds:
//   - title:         page heading / linked phrase base
//   - acceptTerms:   checkbox label; contains the literal "{terms}" placeholder
//   - termsLinkText: phrase that replaces "{terms}" with the link
//   - termsRequired: validation error when the box is left unchecked
//   - clauses:       the 15 clauses, in order, without leading numbers

export const termsContent = {
  ar: {
    title: "الشروط والأحكام",
    acceptTerms: "لقد قرأت وأوافق على {terms}.",
    termsLinkText: "الشروط والأحكام",
    termsRequired: "يجب الموافقة على الشروط والأحكام قبل إرسال القصة.",
    clauses: [
      "بمجرد إرسال القصة أو المشاركة، يعتبر المشارك موافقًا على جميع هذه الشروط والأحكام.",
      "يقر المشارك بأن القصة أو النص المرسل من تأليفه الشخصي، ولا ينتهك أي حقوق ملكية فكرية أو حقوق نشر أو أي حقوق تخص الغير، ويتحمل كامل المسؤولية القانونية عن أي مطالبات تنشأ بسبب ذلك.",
      "يحق للناشر مراجعة القصة وتحريرها وتعديلها لغويًا أو أدبيًا أو اختصارها أو تغيير عنوانها أو تنسيقها بما يتناسب مع سياسة النشر، دون الإخلال بالفكرة العامة.",
      "إرسال القصة لا يعني قبولها أو نشرها، ويحتفظ الناشر بالحق الكامل في قبول أو رفض أي مشاركة دون إبداء الأسباب.",
      "في حال اختيار القصة، يمنح المشارك الناشر حق نشرها ورقيًا ورقميًا، وترجمتها إلى أي لغة، وإعادة نشرها أو طباعتها أو استخدامها في الإصدارات الحالية أو المستقبلية أو في المواد التسويقية المتعلقة بالمشروع.",
      "لا يستحق أي مشارك أي أرباح أو مكافآت أو مقابل مالي بمجرد إرسال القصة أو اختيارها، إلا بعد توقيع اتفاقية مستقلة تحدد نسبة الأرباح وآلية احتسابها وشروط استحقاقها وطريقة صرفها.",
      "يحق للناشر تعديل أو إيقاف أو إلغاء برنامج المشاركة أو تغيير آلية النشر أو الأرباح أو شروط المشاركة في أي وقت دون أي مسؤولية تجاه المشاركين.",
      "لا يحق للمشارك المطالبة بنشر قصته أو ترجمتها أو إعادة طباعتها أو المطالبة بأي تعويض في حال عدم اختيارها.",
      "يلتزم المشارك بعدم إرسال أي محتوى مخالف للقوانين أو الآداب العامة أو يتضمن إساءة أو تشهيرًا أو خطاب كراهية أو تحريضًا أو انتهاكًا لحقوق الآخرين.",
      "يوافق المشارك، في حال اختيار قصته، على استخدام اسمه أو اسمه الأدبي أو صورته أو نبذة تعريفية عنه لأغراض النشر والتسويق والإعلان عن المشروع.",
      "يجب أن يكون المشارك بالغًا، أو أن يحصل على موافقة ولي أمره إذا كان قاصرًا، ويتحمل مسؤولية صحة البيانات المقدمة.",
      "جميع حقوق تصميم الكتاب، وفكرته، وآلية المشاركة، والعلامات التجارية، والهوية البصرية، والمحتوى الخاص بالناشر، مملوكة للناشر، ولا يجوز نسخها أو إعادة استخدامها أو استغلالها بأي شكل دون موافقة خطية مسبقة.",
      "يحتفظ الناشر بحقه في استبعاد أي مشاركة، سواء قبل أو بعد اختيارها، إذا تبين أنها منسوخة أو منقولة أو مخالفة لهذه الشروط، دون أي التزام بدفع أي تعويض أو مكافأة.",
      "قرار لجنة المراجعة والناشر بشأن قبول أو رفض أو استبعاد أي مشاركة يعد قرارًا نهائيًا وغير قابل للاعتراض أو المطالبة.",
      "يحق للناشر تعديل هذه الشروط والأحكام في أي وقت، ويعتبر استمرار المشاركة أو إرسال أي مشاركة جديدة موافقة على آخر نسخة من الشروط."
    ]
  },
  en: {
    title: "Terms and Conditions",
    acceptTerms: "I have read and agree to the {terms}.",
    termsLinkText: "Terms and Conditions",
    termsRequired: "You must agree to the Terms and Conditions before submitting.",
    clauses: [
      "By submitting a story or entry, the participant shall be deemed to have accepted all of these terms and conditions.",
      "The participant warrants that the story or text submitted is their own original work and does not infringe any intellectual property rights, copyright, or any rights belonging to third parties, and the participant accepts full legal responsibility for any claims arising therefrom.",
      "The publisher shall be entitled to review, edit, and amend the story linguistically or stylistically, to abridge it, and to change its title or formatting in a manner consistent with its publishing policy, without prejudice to the overall idea.",
      "Submission of a story shall not constitute acceptance or publication thereof, and the publisher reserves the full right to accept or reject any entry without stating reasons.",
      "Should a story be selected, the participant grants the publisher the right to publish it in print and digital form, to translate it into any language, and to republish, reprint, or use it in current or future editions or in marketing materials relating to the project.",
      "No participant shall be entitled to any profits, rewards, or financial consideration merely by submitting a story or having it selected, save following the execution of a separate agreement specifying the profit share, the method of its calculation, the conditions for its entitlement, and the manner of its payment.",
      "The publisher shall be entitled to modify, suspend, or terminate the participation programme, or to alter the publishing arrangements, the profit terms, or the conditions of participation, at any time and without any liability towards the participants.",
      "The participant shall have no right to demand the publication, translation, or reprinting of their story, nor to claim any compensation, in the event that it is not selected.",
      "The participant undertakes not to submit any content that contravenes the law or public morals, or that contains abuse, defamation, hate speech, incitement, or any infringement of the rights of others.",
      "Should their story be selected, the participant consents to the use of their name, pen name, image, or a biographical profile for the purposes of publishing, marketing, and promoting the project.",
      "The participant must be of full legal age, or, if a minor, must obtain the consent of their guardian, and the participant is responsible for the accuracy of the information provided.",
      "All rights in the design of the book, its concept, the participation mechanism, the trademarks, the visual identity, and the publisher's content are owned by the publisher and may not be copied, reused, or exploited in any form without prior written consent.",
      "The publisher reserves the right to exclude any entry, whether before or after its selection, if it is found to be copied, plagiarised, or in breach of these terms, without any obligation to pay any compensation or reward.",
      "The decision of the review committee and the publisher regarding the acceptance, rejection, or exclusion of any entry shall be final and not subject to objection or claim.",
      "The publisher shall be entitled to amend these terms and conditions at any time, and continued participation or the submission of any new entry shall be deemed acceptance of the latest version of the terms."
    ]
  },
  fr: {
    title: "Conditions générales",
    acceptTerms: "J'ai lu et j'accepte les {terms}.",
    termsLinkText: "conditions générales",
    termsRequired: "Vous devez accepter les conditions générales avant de soumettre votre participation.",
    clauses: [
      "Par la simple soumission de son récit ou de sa participation, le participant est réputé accepter l'ensemble des présentes conditions générales.",
      "Le participant déclare que le récit ou le texte soumis est sa création personnelle et ne porte atteinte à aucun droit de propriété intellectuelle, droit d'auteur ou autre droit de tiers ; il assume l'entière responsabilité juridique de toute réclamation qui en résulterait.",
      "L'éditeur est en droit de relire le récit, de le réviser et de le modifier sur le plan linguistique ou littéraire, de l'abréger, d'en changer le titre ou la mise en forme conformément à sa politique éditoriale, sans pour autant en altérer l'idée générale.",
      "La soumission du récit n'emporte ni son acceptation ni sa publication ; l'éditeur se réserve le plein droit d'accepter ou de refuser toute participation, sans avoir à en justifier les motifs.",
      "En cas de sélection de son récit, le participant concède à l'éditeur le droit de le publier sous forme imprimée et numérique, de le traduire en toute langue, de le republier, de le réimprimer ou de l'exploiter dans les éditions actuelles ou futures, ainsi que dans les supports promotionnels relatifs au projet.",
      "Aucun participant n'a droit à des bénéfices, à une rémunération ou à une quelconque contrepartie financière du seul fait de la soumission ou de la sélection de son récit, sauf après la signature d'un accord distinct fixant la part des bénéfices, ses modalités de calcul, ses conditions d'exigibilité et son mode de versement.",
      "L'éditeur est en droit de modifier, de suspendre ou de supprimer le programme de participation, ou de changer à tout moment les modalités de publication, de répartition des bénéfices ou les conditions de participation, sans engager sa responsabilité envers les participants.",
      "Le participant ne peut exiger la publication, la traduction ou la réimpression de son récit, ni prétendre à une quelconque indemnisation en cas de non-sélection de celui-ci.",
      "Le participant s'engage à ne soumettre aucun contenu contraire aux lois ou aux bonnes mœurs, ni comportant des propos injurieux, diffamatoires, haineux, incitatifs ou portant atteinte aux droits d'autrui.",
      "En cas de sélection de son récit, le participant consent à l'utilisation de son nom, de son nom de plume, de son image ou d'une notice biographique le concernant aux fins de publication, de promotion et de communication relatives au projet.",
      "Le participant doit être majeur ou, s'il est mineur, obtenir l'autorisation de son représentant légal ; il répond de l'exactitude des informations fournies.",
      "L'ensemble des droits afférents à la conception de l'ouvrage, à son concept, au mécanisme de participation, aux marques, à l'identité visuelle et au contenu propre à l'éditeur appartiennent à ce dernier ; ces éléments ne peuvent être reproduits, réutilisés ou exploités sous quelque forme que ce soit sans son consentement écrit et préalable.",
      "L'éditeur se réserve le droit d'écarter toute participation, avant ou après sa sélection, s'il s'avère qu'elle est plagiée, reprise d'une autre source ou contraire aux présentes conditions, sans être tenu de verser une quelconque indemnité ou récompense.",
      "La décision du comité de relecture et de l'éditeur quant à l'acceptation, au refus ou à l'exclusion de toute participation est définitive et insusceptible de contestation ou de réclamation.",
      "L'éditeur est en droit de modifier les présentes conditions générales à tout moment ; la poursuite de la participation ou la soumission de toute nouvelle participation vaut acceptation de la dernière version des conditions."
    ]
  },
  es: {
    title: "Términos y Condiciones",
    acceptTerms: "He leído y acepto los {terms}.",
    termsLinkText: "Términos y Condiciones",
    termsRequired: "Debe aceptar los Términos y Condiciones antes de enviar.",
    clauses: [
      "Con el solo envío del relato o de la participación, se considerará que el participante acepta la totalidad de los presentes Términos y Condiciones.",
      "El participante declara que el relato o texto remitido es de su autoría personal y que no vulnera derecho alguno de propiedad intelectual, derechos de autor ni cualesquiera otros derechos de terceros, asumiendo la plena responsabilidad legal por cualquier reclamación que de ello pudiera derivarse.",
      "El editor tendrá derecho a revisar el relato, así como a corregirlo, modificarlo lingüística o literariamente, abreviarlo, cambiar su título o su formato conforme a su política editorial, sin que ello menoscabe la idea general de la obra.",
      "El envío del relato no implica su aceptación ni su publicación, reservándose el editor el pleno derecho de aceptar o rechazar cualquier participación sin necesidad de expresar las razones de su decisión.",
      "En caso de que el relato resulte seleccionado, el participante otorga al editor el derecho a publicarlo en formato impreso y digital, a traducirlo a cualquier idioma, y a reproducirlo, imprimirlo o utilizarlo en las ediciones actuales o futuras, así como en los materiales promocionales relacionados con el proyecto.",
      "Ningún participante tendrá derecho a beneficios, gratificaciones o contraprestación económica alguna por el mero hecho de enviar o de que se seleccione su relato, sino únicamente tras la firma de un acuerdo independiente que determine el porcentaje de los beneficios, el mecanismo para su cálculo, las condiciones para su devengo y la forma de su abono.",
      "El editor tendrá derecho a modificar, suspender o cancelar el programa de participación, así como a cambiar el mecanismo de publicación, el régimen de beneficios o las condiciones de participación en cualquier momento, sin asumir responsabilidad alguna frente a los participantes.",
      "El participante no tendrá derecho a exigir la publicación de su relato, su traducción o su reimpresión, ni a reclamar indemnización alguna en caso de que aquel no resulte seleccionado.",
      "El participante se compromete a no remitir contenido alguno que contravenga las leyes o las buenas costumbres, o que entrañe injuria, difamación, discurso de odio, incitación o vulneración de los derechos de terceros.",
      "El participante consiente, en caso de que su relato resulte seleccionado, en el uso de su nombre, su seudónimo literario, su imagen o una reseña biográfica suya con fines de publicación, promoción y difusión del proyecto.",
      "El participante deberá ser mayor de edad o, en caso de ser menor, contar con el consentimiento de su representante legal, y será responsable de la veracidad de los datos facilitados.",
      "Todos los derechos sobre el diseño del libro, su concepto, el mecanismo de participación, las marcas, la identidad visual y el contenido propio del editor son titularidad de este, no estando permitida su reproducción, reutilización o explotación en forma alguna sin su consentimiento previo y por escrito.",
      "El editor se reserva el derecho de excluir cualquier participación, ya sea antes o después de su selección, si se comprobara que ha sido copiada, plagiada o que contraviene los presentes Términos, sin obligación alguna de abonar indemnización o gratificación.",
      "La decisión del comité de revisión y del editor relativa a la aceptación, el rechazo o la exclusión de cualquier participación tendrá carácter definitivo, sin que quepa contra ella recurso ni reclamación alguna.",
      "El editor tendrá derecho a modificar los presentes Términos y Condiciones en cualquier momento, considerándose la continuidad en la participación o el envío de cualquier nueva participación como aceptación de la última versión de los Términos."
    ]
  },
  pt: {
    title: "Termos e Condições",
    acceptTerms: "Li e aceito os {terms}.",
    termsLinkText: "Termos e Condições",
    termsRequired: "Deve aceitar os Termos e Condições antes de submeter.",
    clauses: [
      "Com o envio da história ou da participação, considera-se que o participante aceita integralmente os presentes Termos e Condições.",
      "O participante declara que a história ou o texto enviado é da sua autoria pessoal e que não viola quaisquer direitos de propriedade intelectual, direitos de autor ou quaisquer outros direitos de terceiros, assumindo a inteira responsabilidade legal por qualquer reclamação que daí resulte.",
      "O editor tem o direito de rever, editar e alterar a história, do ponto de vista linguístico ou literário, de a resumir, de modificar o seu título ou a sua formatação, em conformidade com a sua política editorial, sem prejuízo da ideia central da obra.",
      "O envio da história não implica a sua aceitação nem a sua publicação, reservando-se o editor o pleno direito de aceitar ou recusar qualquer participação sem necessidade de indicar os respetivos motivos.",
      "Caso a história seja selecionada, o participante concede ao editor o direito de a publicar em formato impresso e digital, de a traduzir para qualquer idioma, bem como de a republicar, imprimir ou utilizar nas edições atuais ou futuras ou nos materiais promocionais relativos ao projeto.",
      "O participante não tem direito a quaisquer lucros, recompensas ou contrapartida financeira pelo simples facto do envio ou da seleção da sua história, salvo após a celebração de um acordo autónomo que defina a percentagem dos lucros, o respetivo método de cálculo, as condições de aquisição do direito e a forma de pagamento.",
      "O editor tem o direito de alterar, suspender ou cancelar o programa de participação, bem como de modificar o mecanismo de publicação, os lucros ou as condições de participação a qualquer momento, sem qualquer responsabilidade perante os participantes.",
      "O participante não tem o direito de exigir a publicação, a tradução ou a reimpressão da sua história, nem de reclamar qualquer indemnização caso a mesma não seja selecionada.",
      "O participante compromete-se a não enviar qualquer conteúdo que viole a lei ou a moral pública, ou que contenha ofensas, difamação, discurso de ódio, incitamento ou violação dos direitos de terceiros.",
      "Caso a sua história seja selecionada, o participante consente na utilização do seu nome, do seu pseudónimo literário, da sua imagem ou de uma nota biográfica a seu respeito, para fins de publicação, promoção e divulgação do projeto.",
      "O participante deve ser maior de idade ou, sendo menor, deve obter o consentimento do seu representante legal, assumindo a responsabilidade pela veracidade dos dados fornecidos.",
      "Todos os direitos sobre a conceção do livro, a sua ideia, o mecanismo de participação, as marcas, a identidade visual e os conteúdos pertencentes ao editor são propriedade deste, não sendo permitida a sua reprodução, reutilização ou exploração, sob qualquer forma, sem o seu consentimento prévio e por escrito.",
      "O editor reserva-se o direito de excluir qualquer participação, quer antes quer depois da sua seleção, caso se verifique que a mesma é plagiada, copiada ou contrária aos presentes Termos, sem qualquer obrigação de pagar qualquer indemnização ou recompensa.",
      "A decisão da comissão de avaliação e do editor quanto à aceitação, recusa ou exclusão de qualquer participação é definitiva e insuscetível de impugnação ou reclamação.",
      "O editor tem o direito de alterar os presentes Termos e Condições a qualquer momento, considerando-se que a continuação da participação ou o envio de qualquer nova participação constitui aceitação da versão mais recente dos Termos."
    ]
  },
  de: {
    title: "Allgemeine Geschäftsbedingungen",
    acceptTerms: "Ich habe die {terms} gelesen und stimme ihnen zu.",
    termsLinkText: "Allgemeinen Geschäftsbedingungen",
    termsRequired: "Sie müssen den Allgemeinen Geschäftsbedingungen zustimmen, bevor Sie absenden.",
    clauses: [
      "Mit der Einreichung der Geschichte oder des Beitrags gilt die Zustimmung des Teilnehmers zu sämtlichen dieser Allgemeinen Geschäftsbedingungen als erteilt.",
      "Der Teilnehmer versichert, dass die eingereichte Geschichte bzw. der eingereichte Text aus seiner eigenen Urheberschaft stammt und keine Rechte des geistigen Eigentums, Urheberrechte oder sonstige Rechte Dritter verletzt; er trägt die volle rechtliche Verantwortung für jegliche Ansprüche, die sich hieraus ergeben.",
      "Der Verlag ist berechtigt, die Geschichte zu prüfen, sie sprachlich oder literarisch zu bearbeiten und zu ändern, sie zu kürzen, ihren Titel zu ändern oder ihre Formatierung anzupassen, soweit dies mit der Verlagspolitik vereinbar ist, ohne dass dabei die Grundidee beeinträchtigt wird.",
      "Die Einreichung der Geschichte bedeutet weder deren Annahme noch deren Veröffentlichung; der Verlag behält sich das uneingeschränkte Recht vor, jeden Beitrag ohne Angabe von Gründen anzunehmen oder abzulehnen.",
      "Im Falle der Auswahl der Geschichte räumt der Teilnehmer dem Verlag das Recht ein, diese in gedruckter und digitaler Form zu veröffentlichen, sie in jede beliebige Sprache zu übersetzen sowie sie erneut zu veröffentlichen, zu drucken oder in gegenwärtigen oder zukünftigen Ausgaben bzw. im Rahmen der mit dem Projekt verbundenen Marketingmaterialien zu verwenden.",
      "Allein durch die Einreichung oder die Auswahl der Geschichte steht dem Teilnehmer kein Anspruch auf Gewinne, Vergütungen oder ein finanzielles Entgelt zu; ein solcher Anspruch entsteht erst nach Unterzeichnung einer gesonderten Vereinbarung, die den Gewinnanteil, dessen Berechnungsmethode, die Voraussetzungen seiner Entstehung sowie die Art der Auszahlung festlegt.",
      "Der Verlag ist berechtigt, das Teilnahmeprogramm jederzeit zu ändern, auszusetzen oder einzustellen sowie die Modalitäten der Veröffentlichung, der Gewinnbeteiligung oder die Teilnahmebedingungen zu ändern, ohne dass hieraus eine Haftung gegenüber den Teilnehmern erwächst.",
      "Der Teilnehmer hat im Falle der Nichtauswahl seiner Geschichte keinen Anspruch auf deren Veröffentlichung, Übersetzung oder Nachdruck und kann keinerlei Entschädigung geltend machen.",
      "Der Teilnehmer verpflichtet sich, keine Inhalte einzureichen, die gegen geltendes Recht oder die guten Sitten verstoßen oder die Beleidigungen, Verleumdungen, Hassrede, Aufstachelung oder eine Verletzung der Rechte Dritter enthalten.",
      "Im Falle der Auswahl seiner Geschichte erklärt sich der Teilnehmer mit der Verwendung seines Namens, seines literarischen Pseudonyms, seines Bildes oder einer Kurzbiografie zu Zwecken der Veröffentlichung, des Marketings und der Bewerbung des Projekts einverstanden.",
      "Der Teilnehmer muss volljährig sein oder, sofern er minderjährig ist, die Zustimmung seines gesetzlichen Vertreters einholen; er trägt die Verantwortung für die Richtigkeit der von ihm gemachten Angaben.",
      "Sämtliche Rechte an der Gestaltung des Buches, an dessen Konzept, an den Teilnahmemodalitäten, an den Marken, an der visuellen Identität sowie an den dem Verlag zugehörigen Inhalten stehen im Eigentum des Verlags und dürfen ohne dessen vorherige schriftliche Zustimmung in keiner Weise vervielfältigt, weiterverwendet oder verwertet werden.",
      "Der Verlag behält sich das Recht vor, jeden Beitrag sowohl vor als auch nach dessen Auswahl auszuschließen, wenn sich herausstellt, dass dieser kopiert, übernommen oder mit diesen Bedingungen unvereinbar ist, ohne dass hieraus eine Verpflichtung zur Zahlung einer Entschädigung oder Vergütung entsteht.",
      "Die Entscheidung des Prüfungsausschusses und des Verlags über die Annahme, Ablehnung oder den Ausschluss eines Beitrags ist endgültig und kann weder angefochten noch zum Gegenstand von Ansprüchen gemacht werden.",
      "Der Verlag ist berechtigt, diese Allgemeinen Geschäftsbedingungen jederzeit zu ändern; die fortgesetzte Teilnahme oder die Einreichung eines neuen Beitrags gilt als Zustimmung zur jeweils aktuellen Fassung der Bedingungen."
    ]
  },
  it: {
    title: "Termini e Condizioni",
    acceptTerms: "Ho letto e accetto i {terms}.",
    termsLinkText: "Termini e Condizioni",
    termsRequired: "È necessario accettare i Termini e Condizioni prima di inviare.",
    clauses: [
      "Con il semplice invio della storia o del contributo, si considera che il partecipante abbia prestato la propria accettazione integrale di tutti i presenti Termini e Condizioni.",
      "Il partecipante dichiara e garantisce che la storia o il testo inviato è di propria ed esclusiva paternità e che non viola alcun diritto di proprietà intellettuale, diritto d'autore o altro diritto di terzi, assumendosi ogni responsabilità legale per qualsiasi pretesa che ne dovesse derivare.",
      "L'editore ha facoltà di revisionare la storia, di curarla, di modificarla sotto il profilo linguistico o letterario, di abbreviarla, di modificarne il titolo o l'impaginazione in conformità alla propria politica editoriale, fermo restando il rispetto dell'idea generale dell'opera.",
      "L'invio della storia non comporta la sua accettazione né la sua pubblicazione; l'editore si riserva il pieno diritto di accettare o respingere qualsiasi contributo senza obbligo di motivazione.",
      "Qualora la storia venga selezionata, il partecipante concede all'editore il diritto di pubblicarla in formato cartaceo e digitale, di tradurla in qualsiasi lingua, nonché di ripubblicarla, ristamparla o utilizzarla nelle edizioni attuali o future ovvero nei materiali promozionali relativi al progetto.",
      "Al partecipante non spetta alcun utile, compenso o corrispettivo economico per il solo fatto di aver inviato o visto selezionata la propria storia, se non a seguito della sottoscrizione di un apposito e separato accordo che determini la quota degli utili, le relative modalità di calcolo, le condizioni di maturazione e le modalità di erogazione.",
      "L'editore ha facoltà di modificare, sospendere o annullare il programma di partecipazione, ovvero di variare in qualsiasi momento le modalità di pubblicazione, la ripartizione degli utili o le condizioni di partecipazione, senza assumere alcuna responsabilità nei confronti dei partecipanti.",
      "Il partecipante non ha diritto di pretendere la pubblicazione, la traduzione o la ristampa della propria storia, né di rivendicare alcun indennizzo nel caso in cui essa non venga selezionata.",
      "Il partecipante si impegna a non inviare contenuti contrari alla legge o al buon costume, ovvero contenenti offese, diffamazione, incitamento all'odio, istigazione o violazione dei diritti altrui.",
      "Il partecipante acconsente, in caso di selezione della propria storia, all'utilizzo del proprio nome, pseudonimo letterario, immagine o profilo biografico per finalità di pubblicazione, promozione e pubblicità del progetto.",
      "Il partecipante deve essere maggiorenne ovvero, se minore, deve ottenere il consenso del proprio rappresentante legale, assumendosi la responsabilità della veridicità dei dati forniti.",
      "Tutti i diritti relativi alla progettazione grafica del libro, alla sua ideazione, alle modalità di partecipazione, ai marchi, all'identità visiva e ai contenuti propri dell'editore appartengono all'editore stesso e non possono essere riprodotti, riutilizzati o sfruttati in alcuna forma senza previo consenso scritto.",
      "L'editore si riserva il diritto di escludere qualsiasi contributo, sia prima sia dopo la sua selezione, qualora risulti copiato, riprodotto da altra fonte o non conforme ai presenti Termini, senza alcun obbligo di corrispondere indennizzi o compensi.",
      "La decisione del comitato di valutazione e dell'editore in merito all'accettazione, al rifiuto o all'esclusione di qualsiasi contributo si intende definitiva, inappellabile e non suscettibile di alcuna contestazione o rivendicazione.",
      "L'editore ha facoltà di modificare i presenti Termini e Condizioni in qualsiasi momento; la prosecuzione della partecipazione o l'invio di qualsiasi nuovo contributo si considera accettazione dell'ultima versione dei Termini."
    ]
  },
  ru: {
    title: "Условия и положения",
    acceptTerms: "Я ознакомился(-ась) с {terms} и принимаю их.",
    termsLinkText: "Условиями и положениями",
    termsRequired: "Для отправки вы обязаны принять Условия и положения.",
    clauses: [
      "С момента отправки рассказа или иного материала Участник считается выразившим согласие со всеми настоящими Условиями и положениями.",
      "Участник подтверждает, что отправленный рассказ или текст является результатом его личного авторского труда и не нарушает каких-либо прав интеллектуальной собственности, авторских прав или иных прав третьих лиц, и несет полную юридическую ответственность по любым претензиям, возникающим в связи с этим.",
      "Издатель вправе рецензировать, редактировать рассказ, вносить в него языковые или литературные правки, сокращать его, изменять его название или форматирование в соответствии с издательской политикой, не нарушая при этом общего замысла произведения.",
      "Отправка рассказа не означает его принятия или публикации; Издатель сохраняет за собой полное право принять или отклонить любой представленный материал без объяснения причин.",
      "В случае отбора рассказа Участник предоставляет Издателю право публиковать его в печатном и цифровом виде, переводить на любой язык, переиздавать, печатать или использовать его в текущих или будущих изданиях, а также в маркетинговых материалах, связанных с проектом.",
      "Ни один Участник не приобретает права на какую-либо прибыль, вознаграждение или денежное возмещение в силу самого факта отправки или отбора рассказа, кроме как после подписания отдельного соглашения, определяющего долю прибыли, порядок ее исчисления, условия возникновения права на нее и способ ее выплаты.",
      "Издатель вправе в любое время изменять, приостанавливать или прекращать программу участия, изменять механизм публикации, порядок распределения прибыли или условия участия без какой-либо ответственности перед Участниками.",
      "Участник не вправе требовать публикации, перевода или переиздания своего рассказа, равно как и требовать какого-либо возмещения в случае, если рассказ не был отобран.",
      "Участник обязуется не направлять материалы, противоречащие закону или общественной нравственности, а также содержащие оскорбления, клевету, разжигание ненависти, подстрекательство или нарушение прав третьих лиц.",
      "Участник в случае отбора его рассказа выражает согласие на использование его имени, литературного псевдонима, изображения или краткой биографической справки о нем в целях публикации, маркетинга и рекламы проекта.",
      "Участник должен быть совершеннолетним либо, если он является несовершеннолетним, получить согласие своего законного представителя, и несет ответственность за достоверность предоставленных данных.",
      "Все права на дизайн книги, ее концепцию, механизм участия, товарные знаки, визуальную идентичность и принадлежащий Издателю контент являются собственностью Издателя и не подлежат копированию, повторному использованию или эксплуатации в какой-либо форме без предварительного письменного согласия.",
      "Издатель сохраняет за собой право исключить любой материал, как до, так и после его отбора, если будет установлено, что он скопирован, заимствован или противоречит настоящим Условиям, без какого-либо обязательства по выплате возмещения или вознаграждения.",
      "Решение рецензионной комиссии и Издателя о принятии, отклонении или исключении любого материала является окончательным и не подлежит обжалованию или оспариванию.",
      "Издатель вправе в любое время изменять настоящие Условия и положения; продолжение участия или отправка любого нового материала считается согласием с последней редакцией Условий."
    ]
  },
  zh: {
    title: "条款与条件",
    acceptTerms: "本人已阅读并同意{terms}。",
    termsLinkText: "条款与条件",
    termsRequired: "提交前，您必须同意本条款与条件。",
    clauses: [
      "参与者一经提交故事或参与作品，即视为同意本条款与条件的全部内容。",
      "参与者声明并保证所提交的故事或文本系其本人原创，未侵犯任何知识产权、著作权或任何第三方权利；对因此引发的任何索赔，参与者承担全部法律责任。",
      "出版方有权在不损害作品总体构思的前提下，根据其出版方针对故事进行审阅、编辑，以及在语言或文学层面进行修改、删节，或变更其标题与版式。",
      "提交故事并不意味着该故事获得采用或出版；出版方保留全权决定采用或拒绝任何参与作品的权利，且无需说明理由。",
      "故事一经选用，参与者即授予出版方以纸质及数字形式出版该故事、将其翻译为任何语言，以及在本项目相关的现有或未来出版物或宣传材料中对其予以再次出版、印刷或使用之权利。",
      "任何参与者仅因提交或选用其故事，均无权获得任何利润、报酬或经济对价；唯有在签署一份单独协议、明确约定利润分成比例、计算方式、归属条件及支付方法之后，方可享有相关权益。",
      "出版方有权随时修改、中止或取消本参与计划，或变更出版机制、利润安排或参与条件，对参与者不承担任何责任。",
      "若参与者的故事未获选用，参与者无权要求出版、翻译或再次印刷其故事，亦无权主张任何补偿。",
      "参与者承诺不提交任何违反法律、公序良俗的内容，或含有侮辱、诽谤、仇恨言论、煽动性内容或侵犯他人权利的内容。",
      "参与者同意，若其故事获选，出版方可为本项目的出版、营销及宣传之目的使用其姓名、笔名、肖像或个人简介。",
      "参与者须为成年人；若为未成年人，则须取得其监护人的同意。参与者应对所提交资料的真实性负责。",
      "图书设计、创意构思、参与机制、商标、视觉形象以及出版方专有内容的一切权利，均归出版方所有；未经事先书面同意，不得以任何形式复制、再次使用或加以利用。",
      "出版方保留排除任何参与作品的权利，无论是在其选用之前还是之后，若发现该作品系抄袭、转载或违反本条款，出版方均可将其排除，且无义务支付任何补偿或报酬。",
      "审阅委员会及出版方就采用、拒绝或排除任何参与作品所作出的决定为最终决定，不得提出异议或主张。",
      "出版方有权随时修改本条款与条件；参与者继续参与或提交任何新的参与作品，即视为同意本条款的最新版本。"
    ]
  },
  hi: {
    title: "नियम एवं शर्तें",
    acceptTerms: "मैंने {terms} पढ़ ली हैं और मैं इनसे सहमत हूँ।",
    termsLinkText: "नियम एवं शर्तें",
    termsRequired: "प्रस्तुत करने से पूर्व आपका नियम एवं शर्तों से सहमत होना अनिवार्य है।",
    clauses: [
      "कहानी अथवा प्रविष्टि प्रस्तुत करते ही प्रतिभागी को इन समस्त नियमों एवं शर्तों से सहमत माना जाएगा।",
      "प्रतिभागी इस आशय की पुष्टि करता है कि प्रस्तुत की गई कहानी अथवा पाठ उसकी अपनी मौलिक रचना है तथा यह किसी भी बौद्धिक संपदा अधिकार, प्रकाशनाधिकार (कॉपीराइट) अथवा किसी तृतीय पक्ष के अधिकारों का उल्लंघन नहीं करती; और इस संबंध में उत्पन्न होने वाले किसी भी दावे की समस्त विधिक जिम्मेदारी वह स्वयं वहन करेगा।",
      "प्रकाशक को यह अधिकार है कि वह प्रकाशन नीति के अनुरूप कहानी की समीक्षा करे, उसका भाषिक अथवा साहित्यिक संपादन एवं संशोधन करे, उसे संक्षिप्त करे, अथवा उसका शीर्षक या प्रारूप परिवर्तित करे, बशर्ते कि उसके मूल भाव के साथ कोई छेड़छाड़ न हो।",
      "कहानी प्रस्तुत करने का यह अर्थ नहीं है कि उसे स्वीकार अथवा प्रकाशित कर लिया जाएगा; प्रकाशक किसी भी प्रविष्टि को बिना कोई कारण बताए स्वीकार अथवा अस्वीकार करने का पूर्ण अधिकार अपने पास सुरक्षित रखता है।",
      "कहानी के चयन की स्थिति में, प्रतिभागी प्रकाशक को यह अधिकार प्रदान करता है कि वह उसे मुद्रित एवं डिजिटल रूप में प्रकाशित करे, किसी भी भाषा में अनुवादित करे, तथा वर्तमान या भविष्य के संस्करणों में अथवा परियोजना से संबंधित विपणन सामग्री में उसका पुनर्प्रकाशन, मुद्रण या उपयोग करे।",
      "केवल कहानी प्रस्तुत करने अथवा उसके चयनित हो जाने मात्र से किसी भी प्रतिभागी को कोई लाभ, पुरस्कार या आर्थिक प्रतिफल प्राप्त करने का अधिकार नहीं होगा, जब तक कि एक पृथक अनुबंध पर हस्ताक्षर न कर लिया जाए, जिसमें लाभ की दर, उसकी गणना की प्रणाली, उसकी पात्रता की शर्तें तथा भुगतान की प्रक्रिया निर्धारित की गई हो।",
      "प्रकाशक को यह अधिकार है कि वह किसी भी समय प्रतिभागिता कार्यक्रम में संशोधन करे, उसे स्थगित या रद्द करे, अथवा प्रकाशन की प्रणाली, लाभ या प्रतिभागिता की शर्तों में परिवर्तन करे, और इसके लिए प्रतिभागियों के प्रति उसका कोई दायित्व नहीं होगा।",
      "कहानी के चयनित न होने की स्थिति में प्रतिभागी को उसके प्रकाशन, अनुवाद या पुनर्मुद्रण की माँग करने अथवा किसी प्रकार के मुआवजे का दावा करने का अधिकार नहीं होगा।",
      "प्रतिभागी इस बात के लिए बाध्य है कि वह ऐसी कोई सामग्री प्रस्तुत न करे जो कानून अथवा सार्वजनिक नैतिकता के विरुद्ध हो, या जिसमें अपमान, मानहानि, घृणा-प्रचार, उकसावा अथवा अन्य व्यक्तियों के अधिकारों का उल्लंघन निहित हो।",
      "अपनी कहानी के चयन की स्थिति में, प्रतिभागी इस बात के लिए सहमति देता है कि परियोजना के प्रकाशन, विपणन एवं विज्ञापन के प्रयोजनार्थ उसके नाम, साहित्यिक उपनाम, चित्र अथवा परिचयात्मक विवरण का उपयोग किया जा सकता है।",
      "प्रतिभागी का वयस्क होना आवश्यक है; यदि वह अवयस्क है तो उसे अपने अभिभावक की सहमति प्राप्त करनी होगी, तथा प्रस्तुत की गई जानकारी की सत्यता की जिम्मेदारी वह स्वयं वहन करेगा।",
      "पुस्तक की डिज़ाइन, उसकी अवधारणा, प्रतिभागिता की प्रणाली, व्यापार-चिह्न (ट्रेडमार्क), दृश्य पहचान तथा प्रकाशक से संबंधित समस्त सामग्री के सभी अधिकार प्रकाशक के स्वामित्व में हैं, और बिना पूर्व लिखित अनुमति के इनकी किसी भी रूप में नकल, पुनर्उपयोग अथवा दोहन करना अनुमेय नहीं है।",
      "प्रकाशक अपने इस अधिकार को सुरक्षित रखता है कि चयन से पूर्व अथवा पश्चात्, यदि यह पाया जाता है कि कोई प्रविष्टि नकल की गई है, कहीं से ली गई है, अथवा इन शर्तों के विरुद्ध है, तो वह किसी भी मुआवजे या पुरस्कार के भुगतान के दायित्व के बिना उस प्रविष्टि को बाहर कर सकता है।",
      "किसी भी प्रविष्टि को स्वीकार, अस्वीकार अथवा बाहर करने के संबंध में समीक्षा समिति एवं प्रकाशक का निर्णय अंतिम होगा तथा उस पर कोई आपत्ति या दावा नहीं किया जा सकेगा।",
      "प्रकाशक को यह अधिकार है कि वह किसी भी समय इन नियमों एवं शर्तों में संशोधन करे; और प्रतिभागिता को जारी रखना अथवा कोई नई प्रविष्टि प्रस्तुत करना शर्तों के नवीनतम संस्करण से सहमति माना जाएगा।"
    ]
  },
  ja: {
    title: "利用規約",
    acceptTerms: "{terms}を読み、これに同意します。",
    termsLinkText: "利用規約",
    termsRequired: "送信する前に、利用規約に同意していただく必要があります。",
    clauses: [
      "参加者は、物語または応募作品を送信した時点をもって、本利用規約のすべてに同意したものとみなされます。",
      "参加者は、送信した物語または文章が自己の創作によるものであり、第三者のいかなる知的財産権、著作権その他の権利をも侵害しないことを表明し、これに起因して生じるいかなる請求についても、その法的責任の一切を自ら負うものとします。",
      "出版社は、出版方針に適合させるため、物語の全体的な趣旨を損なわない範囲において、これを審査し、言語的または文学的に編集・修正し、若しくは要約し、又はその題名若しくは体裁を変更する権利を有します。",
      "物語の送信は、その採用または出版を意味するものではなく、出版社は、理由を示すことなく、いかなる応募作品をも採用し、又は拒否する完全な権利を留保します。",
      "物語が選定された場合、参加者は出版社に対し、当該物語を印刷媒体及び電子媒体において出版し、いかなる言語にも翻訳し、並びに本プロジェクトに関する現在若しくは将来の各版又は販売促進用資料において、これを再出版し、印刷し、又は利用する権利を付与するものとします。",
      "参加者は、物語を送信し、又はこれが選定された時点をもって、いかなる利益、報酬又は金銭的対価をも受ける権利を有しないものとし、これらは、利益の配分割合、その算定方法、受給条件及び支払方法を定める別個の契約を締結した後に限り発生するものとします。",
      "出版社は、いつでも、参加者に対していかなる責任も負うことなく、参加プログラムを変更し、停止し、若しくは中止し、又は出版若しくは利益の方式若しくは参加条件を変更する権利を有します。",
      "参加者は、自己の物語が選定されなかった場合において、その出版、翻訳若しくは再印刷を請求し、又はいかなる補償をも請求する権利を有しないものとします。",
      "参加者は、法令若しくは公序良俗に反する内容、又は侮辱、名誉毀損、憎悪表現、扇動若しくは他者の権利の侵害を含む内容を、一切送信しないことを遵守するものとします。",
      "参加者は、自己の物語が選定された場合、本プロジェクトの出版、販売促進及び宣伝の目的のために、その氏名、筆名、肖像又は紹介文が使用されることに同意するものとします。",
      "参加者は成年者でなければならず、未成年者である場合にはその親権者の同意を得なければならないものとし、また、提出した情報の正確性についての責任を負うものとします。",
      "書籍の意匠、その着想、参加の方式、商標、視覚的アイデンティティ及び出版社に帰属するコンテンツに関する一切の権利は、出版社に帰属するものであり、事前の書面による同意なくして、いかなる形態においても、これらを複製し、再使用し、又は利用することはできません。",
      "出版社は、応募作品が、その選定の前後を問わず、複製若しくは転載されたもの、又は本利用規約に違反するものであることが判明した場合には、いかなる補償又は報酬の支払義務も負うことなく、これを除外する権利を留保します。",
      "応募作品の採用、拒否又は除外に関する審査委員会及び出版社の決定は、最終的なものであり、これに対して異議を申し立て、又は請求を行うことはできないものとします。",
      "出版社は、いつでも本利用規約を変更する権利を有し、参加の継続又は新たな応募作品の送信は、当該規約の最新版に対する同意とみなされるものとします。"
    ]
  }
};

// Short "agree" action label shown on the in-app terms overlay.
const agreeLabels = {
  ar: "أوافق",
  en: "I agree",
  fr: "J'accepte",
  es: "Acepto",
  pt: "Aceito",
  de: "Ich stimme zu",
  it: "Accetto",
  ru: "Принимаю",
  zh: "我同意",
  hi: "मैं सहमत हूँ",
  ja: "同意する"
};

export function getTermsContent(code) {
  const base = termsContent[code] || termsContent.en;
  return { ...base, agree: agreeLabels[code] || agreeLabels.en };
}
