Apothicairerie jumelle
======================

Depuis puzzles/TwinApothecary :

    npx serve .

Le fichier serve.json garde les adresses .html, pour que ?seed= ne soit pas
retiré. Ouvrir les deux pages avec la même graine (1 par défaut) :

    http://localhost:3000/ravabulle.html?seed=1
    http://localhost:3000/troncadelle.html?seed=1

Les pages ne sont pas reliées. Ravabulle est au chevet, Troncadelle au
laboratoire. Le chevet décrit les formes des marques. Le laboratoire lit les
sigils. Le mot d'archive est la moitié de Ravabulle, puis celle de Troncadelle.
Les moitiés viennent de la graine. Ce ne sont pas un mot de campagne.

Une ordonnance vide ne compte qu'une fois inscrite ou administrée. Vider ou
Retirer ramène la visite à l'arrivée et retire sa lettre.

Carnet — Ravabulle
------------------

Formes visibles à l'écran, et la qualité à dire à voix haute :

    zigzag   étincelle
    goutte   flaque
    fente    grincement
    nuage    bouffée

Marque naturelle de chaque espèce (ce n'est pas une plainte) :

    Chevalier-mousse    flaque
    Oiseau-horloger     grincement
    Bête-gelée          étincelle
    Lanterne-brume      bouffée

Règles :

1. Chaque plainte a besoin d'une fiole qui l'apaise.
2. Aucune fiole ne doit gâter une plainte présente à l'arrivée.
3. La marque naturelle n'est pas une plainte. S'il n'y a qu'elle, le plateau
   reste vide.

Carnet — Troncadelle
---------------------

Sigil, nom sur l'étagère, qualité apaisée, qualité gâtée :

    cloche      Campanule    apaise étincelle    gâte flaque
    soleil      Hélianthe    apaise étincelle    gâte bouffée
    feuille     Foliaire     apaise flaque       gâte grincement
    goutte      Rosée        apaise flaque       gâte étincelle
    engrenage   Rouage       apaise grincement   gâte bouffée
    clou        Ferrule      apaise grincement   gâte flaque
    nuage       Brumaire     apaise bouffée      gâte étincelle
    plume       Plumule      apaise bouffée      gâte grincement

Mêmes trois règles que le chevet. Une plainte est une qualité dite par
Ravabulle, en dehors de la marque naturelle de l'espèce.
