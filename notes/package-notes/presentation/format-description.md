A document looks like this:

<document>
  <slideSize w="800" h="600">

  <section h="slideHeight" b="">
    <fill
      image="url-to-image"
      color="#00FF00"
      />

    <scroll-trigger
      name="t1"
      start="sectionTop" start-hits="top|middle|bottom|x%"
      end="sectionBottom" end-hits="top|middle|bottom|x%"
      />

    <pin target="" trigger="">

    <animate target="elements.e1" trigger="t1">
      <keyframe t="0" />
    </animate>

    <element
      name="e1"
      l="10" w="slideWidth-20" t="sectionTop+10" h="slideHeight-20"
      >
      <fill
        image="url-to-image"
        color="#00FF00"
        />
    </element>

    <image
      source=""
      fit="contain|contain|cover"
      alt="Some optional descriptive text"
      l="10" w="200"
      t="sectionTop+10" h="200"
      />

  </section>

</document>
