---
title: Arthur Cross
description: I am a writer and label owner, currently working at X
layout: layout.html
---

Maecenas faucibus mollis interdum. Cras justo odio, dapibus ac facilisis in, egestas eget quam.

<a href="/contact">Contact page</a>

{% for project in collections.project %}

<h2><a href="{{ project.url }}"> {{ project.data.title }}</a></h2>
<p>{{ project.data.description }}</p>

{% endfor %}



