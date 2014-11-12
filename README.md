# THE BRAIN

THE BRAIN reveals clusters of source code that co-execute to produce behavioral features of the program throughout and within executions. We created a clustered visualization of source-code that is informed by dynamic control flow of multiple executions; each cluster represents commonly interacting logic that composes software features. In addition, we render individual executions atop the clustered multiple-execution visualization as user-controlled animations to reveal characteristics of specific executions—these animations may provide exemplars for the clustered features and provide chronology for those behavioral features, or they may reveal anomalous behaviors that do not fit with the overall operational profile of most executions. Both the clustered multiple-execution view and the animated individual-execution view provide insights for the constituent behaviors within executions that compose behaviors of whole executions. Inspired by neural imaging of human brains of people who were subjected to various external stimuli, we designed and implemented THE BRAIN to reveal program activity during execution. The result has revealed the principal behaviors of execution. Those behaviors were revealed to be (in some cases) cohesive, modular source-code structures and (in other cases) cross-cutting, emergent behaviors involving multiple modules. 

## ARCHITECTURE
*More to come.*

## DEPENDENCIES

- d3.js: JavaScript library for manipulating documents based on data (http://d3js.org/)
 
## LIVE DEMO:
- Working Demo: [http://www.ics.uci.edu/~vpalepu/site/brain2.html](http://www.ics.uci.edu/~vpalepu/site/brain2.html)
- Vimeo: [http://vimeo.com/69526834](http://vimeo.com/69526834)

## INSTALLATION & USAGE INSTRUCTIONS
*More to come.*

### Authors:
Lead Engineer: Vijay Krishna Palepu, vpalepu [at] uci [dot] edu.  
James A. Jones, jajones [at] uci [dot] edu.

### Acknowledgements:
This work is supported by the National Science Founda-
tion under awards CAREER CCF1350837 and CCF1116943.

# LICENSE.txt

Also avilable with this distribution at src/LICENSE.txt

```
-----------------------------------------------------------------------------
LICENSE FOR `THE BRAIN`
-----------------------------------------------------------------------------

Copyright (c) 2014, Vijay Krishna Palepu and James A. Jones, Spider Lab (http://spideruci.org/)
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this 
list of conditions, the following list of research publications along with 
their citations and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, 
this list of conditions, citations for the following research publications and 
the following disclaimer in the documentation and/or other materials provided 
with the distribution.

3. Research data, works or publications that make use of this distribution, or 
its derivative(s), in source code or in binday form must cite the following 
research publications.

4. Neither the name of the copyright holder nor the names of its contributors 
may be used to endorse or promote products derived from this software without
specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE 
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL 
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR 
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


----------------------
RESEARCH PUBLICATIONS 
----------------------

[RESEARCH-PUBLICATION-1] Palepu, Vijay Krishna and Jones, James, "Visualizing 
Constituent Behaviors within Executions," , 2013 1st IEEE International 
Working Conference on Software Visualization (VISSOFT), pp.1-4, 27-28 
September 2013.

[CITATIONS]
[Format: BibTex]
@INPROCEEDINGS{6650537,
author={Palepu, V.K. and Jones, J.A.},
booktitle={Software Visualization (VISSOFT), 2013 First IEEE Working Conference on},
title={Visualizing constituent behaviors within executions},
year={2013},
month={Sept},
pages={1-4},
keywords={computer animation;data flow analysis;data visualisation;program visualisation;source coding;THE BRAIN;behavioral feature production;constituent behavior visualization;dynamic control flow;modular source-code structures;neural imaging;program activity;software features;source code clustered visualization;user-controlled animations;Animation;Data visualization;Force;Layout;Software;Visualization;XML},
doi={10.1109/VISSOFT.2013.6650537},}

[Format: Plain Text]
Palepu, V.K.; Jones, J.A., "Visualizing constituent behaviors within executions," Software Visualization (VISSOFT), 2013 First IEEE Working Conference on , vol., no., pp.1,4, 27-28 Sept. 2013
doi: 10.1109/VISSOFT.2013.6650537
keywords: {computer animation;data flow analysis;data visualisation;program visualisation;source coding;THE BRAIN;behavioral feature production;constituent behavior visualization;dynamic control flow;modular source-code structures;neural imaging;program activity;software features;source code clustered visualization;user-controlled animations;Animation;Data visualization;Force;Layout;Software;Visualization;XML},
URL: http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=6650537&isnumber=6650514



----------------------------------------------------------------------------
LICENSE FOR `D3.JS`
----------------------------------------------------------------------------

Copyright (c) 2010-2014, Michael Bostock
All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
* Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

* The name Michael Bostock may not be used to endorse or promote products
derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```