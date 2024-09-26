﻿global gViewRender, c, gPEprops, keepLooping, gRenderCameraTilePos, gLastImported, gProps, afterEffects, gAnyDecals, gRenderTrashProps, gCurrentlyRenderingTrash, gESoftProp
global softProp, propsToRender

on exitFrame me
  if gViewRender then
    if _key.keyPressed(48) and _movie.window.sizeState <> #minimized then
      _movie.go(9)
    end if
    me.newFrame()
    if keepLooping then
      go the frame
    end if
  else
    repeat while keepLooping
      me.newFrame()
    end repeat
  end if
end

on newFrame me
  
  if(softProp <> void)then
    if (gESoftProp < 1)then
      renderSoftProp()
    else
      renderESoftProp()
    end if
  else
    
    if(gCurrentlyRenderingTrash)then
      
      if(c > gRenderTrashProps.count)then
        gCurrentlyRenderingTrash = false
        if(propsToRender.count > 0)then
          c = 1
          propData = propsToRender[c]
        else
          keepLooping = false
          exit
        end if
      else
        propData = gRenderTrashProps[c]
      end if
    else
      if(c > propsToRender.count)then
        keepLooping = 0
        exit
      end if
      propData = propsToRender[c]
    end if
    
    prop = gProps[propData[3].locH].prps[propData[3].locV]
    if(ShouldThisPropRender(prop, propData[4], propData[5].settings))then
      me.updateText()
      qd = propData[4]
      dp = -propData[1]
       
      if(gCurrentlyRenderingTrash = false)then
        qd = qd * (20.0/16.0)
      end if
      
      mdPoint = (qd[1] + qd[2] + qd[3] + qd[4])/4.0
      
      savSeed = the randomSeed
      global gLOprops
      the randomSeed = seedForTile(giveGridPos(mdPoint), propData[5].settings.seed)
      -- put "prop Seed " && propsToRender[c][2] && the randomSeed
      if(gCurrentlyRenderingTrash = false)then
        qd = qd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20] -- [point(15*20, 10*20), point(15*20, 10*20), point(15*20, 10*20), point(15*20, 10*20)]
      end if
      -- put prop.nm && prop.tp
      if(gCurrentlyRenderingTrash)then
        data = []
      else
        data = propsToRender[c][5]
      end if
      
      renderProp(prop, dp, qd, mdPoint, data)
      
      the randomSeed = savSeed
    end if
    c = c + 1
  end if
end

on ShouldThisPropRender(prop, qd, settings)
  
  if(settings.renderTime <> afterEffects)then
    return false
  end if
  
  if(gCurrentlyRenderingTrash = false)then
    qd = qd * (20.0/16.0)
    qd = qd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
  end if
  
  mdPoint = (qd[1] + qd[2] + qd[3] + qd[4])/4.0
  
  dig = 0
  repeat with q =  1 to 4 then
    if(DiagWI(mdPoint, qd[q], dig) = false) then
      dig = Diag(mdPoint, qd[q])
    end if
  end repeat
  
  -- put prop[1] && Diag(mdPoint, closestPntInRect(rect(-100, -100, 1700, 900), mdPoint)) && dig
  
  if(Diag(mdPoint, closestPntInRect(rect(-50, -100, 2050, 1100), mdPoint)) > dig) then
    --   put "Culling a prop " & prop
    return false
  end if
  
  
  -- case prop.tp of
  --   "simpleDecal", "variedDecal":
  --      renderAfterEffects = 1
  -- end case
  return true
end

on updateText me
  txt = ""
  put "<Rendering props>                                                            Press TAB to abort" after txt
  
  put RETURN after txt
  
  viewProp = c
  if(softProp <> void)then
    viewProp = c - 1
  end if
  
  if(gCurrentlyRenderingTrash = true)then
    put "Trash props -   " & c & " / " & gRenderTrashProps.count after txt
    put RETURN after txt
  else
    repeat with prp = 1 to propsToRender.count then
      propAddress = propsToRender[prp][3]
      if (ShouldThisPropRender(gProps[propAddress.loch].prps[propAddress.locV], propsToRender[prp][4], propsToRender[prp][5].settings))then
        if prp = viewProp then
          put string(prp)&". ->"&propsToRender[prp][2] after txt
        else
          put string(prp)&". "&propsToRender[prp][2] after txt
        end if
        put RETURN after txt
      end if
    end repeat
  end if
  
  member("effectsL").text = txt
end

on renderProp(prop, dp, qd, mdPoint, data)
  sav2 = member("previewImprt")
  if gLastImported <> prop.nm then
    tileAsProp = 0
    repeat with q2 = 1 to prop.tags.count then
      if prop.tags[q2] = "Tile" then
        tileAsProp = 1
        exit repeat
      end if
    end repeat
    if(tileAsProp)then
      member("previewImprt").importFileInto("Graphics\" &prop.nm&".png")
    else
      member("previewImprt").importFileInto("Props\" &prop.nm&".png")
    end if
    sav2.name = "previewImprt"
    gLastImported = prop.nm
  end if
  -- put prop.nm && prop.tp && qd
  case prop.tp of
    "standard", "variedStandard":
      renderVoxelProp(prop, dp, qd, mdPoint, data)
    "simpleDecal", "variedDecal":
      gAnyDecals = 1
      renderDecal(prop, dp, qd, mdPoint, data)
    "rope":
      renderRope(prop, propsToRender[c][5], dp)
    "soft", "variedSoft", "antimatter":
      gESoftProp = 0
      initRenderSoftProp(prop, qd, data, dp)
    "softEffect":
      gESoftProp = 1
      initRenderSoftProp(prop, qd, data, dp)
    "long":
      renderLongProp(qd, prop, propsToRender[c][5], dp)
  end case
  
  DoPropTags(prop, dp, qd)
end

on renderVoxelProp(prop, dp, qd, mdPoint, propData)
  var = 1
  if(prop.tp = "variedStandard")then
    var = propData.settings.variation
  end if
  ps = 1
  sav2 = member("previewImprt")
  
  colored = (prop.tags.GetPos("colored") > 0)
  if(colored)then
    gAnyDecals = 1
  end if
  
  repeat with q = 1 to prop.repeatL.count then
    gtRect = rect(0,0,prop.sz.locH*20, prop.sz.locV*20) 
    gtRect = gtRect + rect(gtRect.width*(var-1),gtRect.height*(ps-1), gtRect.width*(var-1), gtRect.height*(ps-1))+rect(0,1,0,1)
    repeat with q2 = 1 to prop.repeatL[q] then
      
      case(prop.colorTreatment) of
        "standard":
          member("layer"&string(dp)).image.copyPixels(sav2.image, qd, gtRect, {#ink:36})
        "bevel":
          dumpImg = image( gtRect.width,  gtRect.height, 1)
          dumpImg.copyPixels(sav2.image, dumpImg.rect, gtRect)
          inverseImg = makeSilhoutteFromImg(dumpImg, 1)
          dumpImg = image( member("layer"&string(dp)).image.width,  member("layer"&string(dp)).image.height, 32)
          dumpImg.copyPixels(member("pxl").image, qd, rect(0,0,1,1), {#color:color(0, 255, 0)})
          
          
          repeat with b = 1 to prop.bevel then
            repeat with a in [[color(255, 0, 0), point(-1, -1)],[color(255, 0, 0), point(0, -1)],[color(255, 0, 0), point(-1, 0)], [color(0, 0, 255), point(1, 1)],[color(0, 0, 255), point(0, 1)],[color(0, 0, 255), point(1, 0)]] then
              dumpImg.copyPixels(inverseImg, qd + [a[2]*b,a[2]*b,a[2]*b,a[2]*b], inverseImg.rect, {#color:a[1], #ink:36})
            end repeat
          end repeat
          
          dumpImg.copyPixels(inverseImg, qd, inverseImg.rect, {#color:color(255, 255, 255), #ink:36})
          
          inverseImg = image( dumpImg.width,  dumpImg.height, 1)
          inverseImg.copyPixels(member("pxl").image, inverseImg.rect, rect(0,0,1,1))
          inverseImg.copyPixels(member("pxl").image, qd, rect(0,0,1,1), {#color:color(255, 255, 255)})
          
          dumpImg.copyPixels(inverseImg, dumpImg.rect, inverseImg.rect, {#color:color(255, 255, 255), #ink:36})
          
          member("layer"&string(dp)).image.copyPixels(dumpImg, dumpImg.rect, dumpImg.rect, {#ink:36})
      end case
      
      if(colored)then
        member("layer"&string(dp)&"dc").image.copyPixels(sav2.image, qd, gtRect+rect(prop.sz.locH*20,0,prop.sz.locH*20, 0), {#ink:36})
      end if
      
      dp = dp + 1
      if(dp > 29)then
        exit repeat
      end if
    end repeat
    ps = ps + 1
    if(dp > 29)then
      exit repeat
    end if
    
  end repeat
end


on renderDecal(prop, dp, qd, mdPoint, data)
  rnd = 1
  ps = 1
  sav2 = member("previewImprt")
  -- put "render decal"
  depthZero = dp
  repeat with testDp in [0, 10, 20] then
    if(dp <= testDp)and(dp + prop.depth > testDp)then
      depthZero = testDp
      exit repeat
    end if
  end repeat
  
  dirq = directionsQuad()
  
  actualDepth = prop.depth
  if(dp + prop.depth > 29)then
    actualDepth = 29 - dp
  end if
  
  averageSz = (Diag(qd[1], qd[2]) + Diag(qd[2], qd[3]) + Diag(qd[3], qd[4]) + Diag(qd[4], qd[1]))/4.0
  averageSz = (averageSz + 80.0)/2.0
  averageSz = averageSz / 12.0
  averageSz = averageSz / ((4.0 + actualDepth)/5.0)
  dirq = dirq * averageSz
  
  getRect = sav2.image.rect
  if(prop.tp = "variedDecal")then
    getRect = rect(prop.pxlSize.locH * (data.settings.variation-1), 0, prop.pxlSize.locH * data.settings.variation, prop.pxlSize.locV)+rect(0,1,0,1)
  end if
  
  clr = color(0,0,0)
  if(data.settings.findPos(#color) <> void) then
    if(data.settings.color > 0)then
      global gPEcolors
      clr = gPEcolors[data.settings.color][2]
    end if
  end if
  
  repeat with q = 1 to data.settings.customDepth then
    member("layer"&string(dp)&"dc").image.copyPixels(sav2.image, qd+(dirq*(dp-depthZero)), getRect, {#ink:36, #color:clr})
    dp = dp + 1
    if(dp > 29)then
      exit repeat
    end if
  end repeat
end

on directionsQuad()
  --  seed =  the randomSeed
  --  the randomSeed = gLOprops.tileSeed
  qDirs = []
  frst = degToVec(random(360))
  l1 = [[random(100), frst], [random(100), -frst], [random(100), degToVec(random(360))], [random(100), degToVec(random(360))]]
  l1.sort()
  repeat with q = 1 to 4 then
    qDirs.add(l1[q][2])
  end repeat
  
  return qDirs
  --  
  --  newImg = member(mem).image.duplicate()
  --  qd = [point(0,0), point(newImg.width, 0), point(newImg.width, newImg.height), point(0,newImg.height)]
  --  qd = qd + qDirs*fac
  --  member(mem).image.copypixels(newImg, qd, newImg.rect)
  --  
  --  the randomSeed = seed
end



on renderRope(prop, data, dp)
  lastPos = data.points[1]
  lastDir = MoveToPoint(data.points[1], data.points[2], 1.0)
  lastPerp = CorrectPerp(lastDir)
  
  --[gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
  repeat with q = 1 to data.points.count then
    pos = data.points[q]
    
    
    if(q < data.points.count)then
      dir = MoveToPoint(data.points[q], data.points[q+1], 1.0)
    else
      dir = lastDir
    end if
    perp = CorrectPerp(dir)
    
    renderRopeSegment(q, prop, data, dp, pos, dir, perp, lastPos, lastDir, lastPerp)
    
    lastPos = pos
    lastDir = dir
    lastPerp = perp
    -- end if
  end repeat
  
end

on CorrectPerp(dir)
  --  if(dir = point(0, -1))then
  --    return point(1, 0)
  --  else if (dir = point(1, 0))then
  --    return point(1, 0)
  --  else if (dir = point(0, 1))then
  --    return point(0, 1)
  --  else if (dir = point(-1, 0))then
  --    return point(-1, 0)
  --  else
  return giveDirFor90degrToLine(-dir+point(0.001, -0.001), dir)
  -- end if
end

on renderRopeSegment(num, prop, data, dp, pos, dir, perp, lastPos, lastDir, lastPerp)
  case prop.nm of
    "wire", "Zero-G Wire":
      wdth = data.settings.thickness/2.0
      
      pastQd = [pos - perp*wdth, pos + perp*wdth, lastPos + lastPerp*wdth, lastPos - lastPerp*wdth]
      pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
      
      member("layer"&string(dp)).image.copyPixels(member("pxl").image, pastQd, rect(0,0,1,1), {#color:color(255, 0,0)})
      
    "tube":
      wdth = 5.0
      
      pastQd = [pos - perp*wdth, pos + perp*wdth, lastPos + lastPerp*wdth, lastPos - lastPerp*wdth]
      pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
      
      repeat with a = 1 to 4 then
        if(dp + a <= 30)then
          member("layer"&string(dp + a - 1)).image.copyPixels(member("tubeGraf").image, pastQd, rect(0,(a-1)*10,10,a*10), {#ink:36})
        else 
          exit repeat
        end if
      end repeat
      
      
    "ThickWire":
      wdth = 2
      pastQd = [pos - perp*wdth, pos + perp*wdth, lastPos + lastPerp*wdth, lastPos - lastPerp*wdth]
      pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
      
      repeat with a = 1 to 3 then
        if(dp + a <= 30)then
          member("layer"&string(dp + a - 1)).image.copyPixels(member("thickWireGraf").image, pastQd, rect(0,(a-1)*4,4,a*4), {#ink:36})
        else 
          exit repeat
        end if
      end repeat
      
      
    "RidgedTube":
      wdth = 5
      pastQd = [pos - perp*wdth, pos + perp*wdth, lastPos + lastPerp*wdth, lastPos - lastPerp*wdth]
      pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
      
      repeat with a = 1 to 4 then
        if(dp + a <= 30)then
          member("layer"&string(dp + a - 1)).image.copyPixels(member("ridgedTubeGraf").image, pastQd, rect(0,(a-1)*10,5,a*10), {#ink:36})
        else 
          exit repeat
        end if
      end repeat
      
      
    "Fuel Hose", "Zero-G Tube":
      wdth = 7
      jointSize = 6
      col = 0
      if(prop.nm = "Zero-G Tube")then
        wdth = 6
        jointSize = 4
        if(data.settings.applyColor = 1)then
          col = 1
          gAnyDecals = 1
        end if
      end if
      myPerp = lastPerp
      pastQd = [pos - myPerp*wdth, pos + myPerp*wdth, lastPos + myPerp*wdth, lastPos - myPerp*wdth]
      pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
      
      
      repeat with a = 1 to 5 then
        if(dp + a <= 30)then
          member("layer"&string(dp + a - 1)).image.copyPixels(member("fuelHoseGraf").image, pastQd, rect(0,1+(a-1)*16,14,1+a*16), {#ink:36})
          if(col = 1)then
            member("layer"&string(dp + a - 1)&"dc").image.copyPixels(member("fuelHoseCol").image, pastQd, rect(0,1+(a-1)*16,14,1+a*16), {#ink:36})
          end if
        else 
          exit repeat
        end if
      end repeat
      
      repeat with a = 1 to 4 then
        if(dp + a <= 29)then
          member("layer"&string(dp + a)).image.copyPixels(member("fuelHoseJoint").image, rect(pos, pos)+rect(-jointSize,-jointSize,jointSize,jointSize)-rect(gRenderCameraTilePos*20,gRenderCameraTilePos*20), rect(0,1+(a-1)*12,12,1+a*12), {#ink:36})
        else 
          exit repeat
        end if
      end repeat
      
    "Broken Fuel Hose":
      
      dr = MoveToPoint(pos, lastPos, 1.0)
      dst = diag(pos, lastPos)
      
      repeat with b = 0 to 2 then
        wdth = 5
        
        pntA = pos + dr*(dst/3.0)*b
        pntB = pos + dr*(dst/3.0)*(b+1)
        
        Aprp = MoveToPoint(point(0,0), point( lerp(lastPerp.loch, perp.loch, b/3.0), lerp(lastPerp.locv, perp.locv, b/3.0)), 1.0)
        Bprp = MoveToPoint(point(0,0), point( lerp(lastPerp.loch, perp.loch, (b+1)/3.0), lerp(lastPerp.locv, perp.locv, (b+1)/3.0)), 1.0)
        
        pastQd = [pntA - Aprp*wdth, pntA + Aprp*wdth, pntB + Bprp*wdth, pntB - Bprp*wdth]
        pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
        
        
        repeat with a = 2 to 5 then
          if(dp + a <= 29)then
            member("layer"&string(dp + a)).image.copyPixels(member("ridgedTubeGraf").image, pastQd, rect(0,(a-1)*10,5,a*10), {#ink:36})
          else 
            exit repeat
          end if
        end repeat
      end repeat
      
      
      if(random(5)<4)then
        wdth = 7
        myPerp = lastPerp
        pastQd = [pos - myPerp*wdth, pos + myPerp*wdth, lastPos + myPerp*wdth, lastPos - myPerp*wdth]
        pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
        
        repeat with a = 1 to 5 then
          if(dp + a <= 30)then
            member("layer"&string(dp + a - 1)).image.copyPixels(member("fuelHoseGraf").image, pastQd, rect(0,1+(a-1)*16,14,1+a*16), {#ink:36})
          else 
            exit repeat
          end if
        end repeat
        
        repeat with a = 1 to 4 then
          if(dp + a <= 29)then
            member("layer"&string(dp + a)).image.copyPixels(member("fuelHoseJoint").image, rect(pos, pos)+rect(-6,-6,6,6)-rect(gRenderCameraTilePos*20,gRenderCameraTilePos*20), rect(0,1+(a-1)*12,12,1+a*12), {#ink:36})
          else 
            exit repeat
          end if
        end repeat
      end if
      
    "Large Chain", "Large Chain 2":
      dr = MoveToPoint(pos, lastPos, 1.0)
      dst = diag(pos, lastPos)
      if((num mod 2)=0)then
        wdth = 10
      else
        wdth = 3.5
      end if
      
      pntA = lastPos + dr*11
      pntB = pos - dr*11
      
      pastQd = [pntA - lastPerp*wdth, pntA + lastPerp*wdth, pntB + lastPerp*wdth, pntB - lastPerp*wdth]
      pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
      
      if(prop.nm = "Large Chain")then
        repeat with a = 0 to 5 then
          pstDp = restrict(dp + a, 0, 29)
          member("layer"&string(pstDp)).image.copyPixels(member("largeChainGraf").image, pastQd, rect(((num mod 2)=1)*20,1+a*50,20 + ((num mod 2)=1)*7,1+(a+1)*50), {#ink:36})
          member("layer"&string(pstDp)).image.copyPixels(member("largeChainGrafHighLight").image, pastQd + [point(-2,-2), point(-2,-2), point(-2,-2), point(-2,-2)], rect(((num mod 2)=1)*20,1+a*50,20 + ((num mod 2)=1)*7,1+(a+1)*50), {#ink:36})
          
          pstDp = restrict(dp + 4 + a, 0, 29)
          b = 5 - a
          member("layer"&string(pstDp)).image.copyPixels(member("largeChainGraf").image, pastQd, rect(((num mod 2)=1)*20,1+b*50,20 + ((num mod 2)=1)*7,1+(b+1)*50), {#ink:36})
          member("layer"&string(pstDp)).image.copyPixels(member("largeChainGrafHighLight").image, pastQd + [point(-2,-2), point(-2,-2), point(-2,-2), point(-2,-2)], rect(((num mod 2)=1)*20,1+b*50,20 + ((num mod 2)=1)*7,1+(b+1)*50), {#ink:36})
        end repeat
      else
        repeat with a = 0 to 5 then
          pstDp = restrict(dp + a, 0, 29)
          member("layer"&string(pstDp)).image.copyPixels(member("largeChainGraf2").image, pastQd, rect(((num mod 2)=1)*20,1+a*50,20 + ((num mod 2)=1)*7,1+(a+1)*50), {#ink:36})
          member("layer"&string(pstDp)).image.copyPixels(member("largeChainGraf2HighLight").image, pastQd + [point(-2,-2), point(-2,-2), point(-2,-2), point(-2,-2)], rect(((num mod 2)=1)*20,1+a*50,20 + ((num mod 2)=1)*7,1+(a+1)*50), {#ink:36})
          
          pstDp = restrict(dp + 4 + a, 0, 29)
          b = 5 - a
          member("layer"&string(pstDp)).image.copyPixels(member("largeChainGraf2").image, pastQd, rect(((num mod 2)=1)*20,1+b*50,20 + ((num mod 2)=1)*7,1+(b+1)*50), {#ink:36})
          member("layer"&string(pstDp)).image.copyPixels(member("largeChainGraf2HighLight").image, pastQd + [point(-2,-2), point(-2,-2), point(-2,-2), point(-2,-2)], rect(((num mod 2)=1)*20,1+b*50,20 + ((num mod 2)=1)*7,1+(b+1)*50), {#ink:36})
        end repeat
      end if
      
    "Bike Chain":
      dr = MoveToPoint(pos, lastPos, 1.0)
      dst = diag(pos, lastPos)
      wdth = 17
      
      pntA = lastPos + dr*17
      pntB = pos - dr*17
      
      pastQd = [pntA - lastPerp*wdth, pntA + lastPerp*wdth, pntB + lastPerp*wdth, pntB - lastPerp*wdth]
      pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
      
      renderBeveledImage(member("BikeChainBolt").image, dp, [lastPos + point(-8,-8), lastPos + point(8,-8), lastPos + point(8,8), lastPos + point(-8,8)] - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20], 2)
      
      repeat with a = 1 to 9 then
        pstDp = restrict(dp + a, 0, 29)
        member("layer"&string(pstDp)).image.copyPixels(member("BikeChainBolt").image, rect(lastPos, lastPos) + rect(-8,-8,8,8)-rect(gRenderCameraTilePos*20, gRenderCameraTilePos*20), member("BikeChainBolt").image.rect, {#ink:36, #color:color(0, 255, 0)})
      end repeat
      
      if((num mod 2)=0)then
        pstDp = restrict(dp + 1, 0, 29)
        renderBeveledImage(member("BikeChainSegment").image, pstDp, pastQd, 1)
        pstDp = restrict(dp + 2, 0, 29)
        member("layer"&string(pstDp)).image.copyPixels(member("BikeChainSegment").image, pastQd, member("BikeChainSegment").image.rect, {#ink:36, #color:color(0,255,0)})
        
        pstDp = restrict(dp + 8, 0, 29)
        renderBeveledImage(member("BikeChainSegment").image, pstDp, pastQd, 1)
        pstDp = restrict(dp + 9, 0, 29)
        member("layer"&string(pstDp)).image.copyPixels(member("BikeChainSegment").image, pastQd, member("BikeChainSegment").image.rect, {#ink:36, #color:color(0,255,0)})
      else
        pstDp = restrict(dp + 3, 0, 29)
        renderBeveledImage(member("BikeChainSegment").image, pstDp, pastQd, 1)
        pstDp = restrict(dp + 4, 0, 29)
        member("layer"&string(pstDp)).image.copyPixels(member("BikeChainSegment").image, pastQd, member("BikeChainSegment").image.rect, {#ink:36, #color:color(0,255,0)})
        
        pstDp = restrict(dp + 6, 0, 29)
        renderBeveledImage(member("BikeChainSegment").image, pstDp, pastQd, 1)
        pstDp = restrict(dp + 7, 0, 29)
        member("layer"&string(pstDp)).image.copyPixels(member("BikeChainSegment").image, pastQd, member("BikeChainSegment").image.rect, {#ink:36, #color:color(0,255,0)})
      end if
      
    "Fat Hose":
      wdth = 20
      pastQd = [pos - perp*wdth, pos + perp*wdth, lastPos + lastPerp*wdth, lastPos - lastPerp*wdth]
      pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
      
      repeat with a = 0 to 4 then
        if(dp + a + 1 <= 29)then
          member("layer"&string(dp + a + 1)).image.copyPixels(member("fatHoseGraf").image, pastQd, rect(40,a*40,80,(a+1)*40), {#ink:36})
        else 
          exit repeat
        end if
      end repeat
      
      pastQd = [pos - perp*wdth - dir*5, pos + perp*wdth - dir*5, pos + perp*wdth + dir*5, pos - perp*wdth + dir*5]
      pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
      
      repeat with a = 0 to 5 then
        if(dp + a <= 29)then
          member("layer"&string(dp + a)).image.copyPixels(member("fatHoseGraf").image, pastQd, rect(0,a*10,40,(a+1)*10), {#ink:36})
        else 
          exit repeat
        end if
      end repeat
      
      mdPnt = (pos + lastPos)/2
      mdPnt = mdPnt - gRenderCameraTilePos*20
      member("layer"&string(dp)).image.copyPixels(member("fatHoseGraf").image, rect(mdPnt,mdPnt)+rect(-5,-5,5,5), rect(80,0,90,10), {#ink:36})
      
    "Wire Bunch", "Wire Bunch 2":
      if((num mod 2) = 0)or(num = data.points.count) then
        
        dr = MoveToPoint(pos, lastPos, 1.0)
        
        
        global wireBunchSav
        
        
        if wireBunchSav = void then
          wireBunchSav = []
          wireBunchSav.add([lastPos, lastDir])
          repeat with i = 1 to 19 then
            wireBunchSav.add(DegToVec(random(360)))
          end repeat
        end if
        
        possiblePositions = []
        repeat with i = 1 to 10 then
          possiblePositions.add(DegToVec((i.float / 10.0) * 360))
        end repeat
        repeat with i = 1 to 6 then
          possiblePositions.add(DegToVec((i.float / 6.0) * 360)*0.75)
        end repeat
        repeat with i = 1 to 3 then
          possiblePositions.add(DegToVec((i.float / 3.0) * 360)*0.5)
        end repeat
        useLastPos = wireBunchSav[1][1]
        useLastDir = wireBunchSav[1][2]
        useLastPerp = giveDirFor90degrToLine(-useLastDir, useLastDir)
        
        repeat with i = 1 to 19 then
          a = wireBunchSav[i+1]
          indx = random(possiblePositions.count)
          b = possiblePositions[indx]
          possiblePositions.deleteAt(indx)
          
          aPos = useLastPos + useLastPerp*a.locH*18
          
          aDp = (dp + 2.5 + a.locV*2.5).integer + 1
          
          bPos = pos + perp*b.locH*18
          bDp = (dp + 2.5 + b.locV*2.5).integer + 1
          
          aHandle = aPos + useLastDir * lerp(Diag(aPos, bPos)/2.0, (40+random(40)).float, 0.5)
          bHandle = bPos - dir * lerp(Diag(aPos, bPos)/2.0, (40+random(40)).float, 0.5)
          
          c2 = LerpVector(a, b, 0.5)
          cPos = lastPos + lastPerp*c2.locH*18
          aHandle = lerpVector(aHandle, cPos, 0.5)
          bHandle = lerpVector(bHandle, cPos, 0.5)
          
          if(random(35) = 1)then
            bPos = aPos + useLastDir * 60.0 + DegToVec(random(360))*random(60)
            bHandle = lerpVector(bHandle, bPos + DegToVec(random(360))*random(30), 0.5)
          else  if(random(35) = 1)then
            aPos = bPos - dir * 60.0 + DegToVec(random(360))*random(60)
            aHandle = lerpVector(aHandle, aPos + DegToVec(random(360))*random(30), 0.5)
          end if
          
          DrawBezierWire(lastDir, aPos, aHandle, bPos, bHandle, aDp, bDp)
          
          
          
          wireBunchSav[i+1] = b
        end repeat
        wireBunchSav[1][1] = pos
        wireBunchSav[1][2] = dir
      end if
      
      
      
      wdth = 20
      pastQd = [pos -dr*3.5 - perp*wdth, pos -dr*3.5 + perp*wdth, pos + dr*3.5 + perp*wdth, pos +dr*3.5 - perp*wdth]
      pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
      mnClamp = 0
      if(dp>=6)then
        mnClamp = 6
      end if
      repeat with a2 = 0 to 10 then
        a = 10-a2
        if(prop.nm = "Wire Bunch")then
          member("layer"&string(restrict(dp + a - 1, mnClamp, 29))).image.copyPixels(member("wireBunchGraf").image, pastQd, rect(0,1+a*7,42,1+(a+1)*7), {#ink:36})
        else
          member("layer"&string(restrict(dp + a - 1, mnClamp, 29))).image.copyPixels(member("wireBunchGraf2").image, pastQd, rect(0,a*7,42,(a+1)*7), {#ink:36})
        end if
      end repeat
      
      
      
      if(num = data.points.count)then
        wireBunchSav = void
      end if
  end case
end

global wireBunchSav

on DrawBezierWire(startDir, A, aHandle, B, bHandle, aDp, bDp)
  
  repeats = (Diag(A, B) / 5.0).integer
  lastDir = startDir
  lastPos = A - startDir
  lastPerp = giveDirFor90degrToLine(lastPos, A)
  
  repeat with i = 1 to repeats then
    pos = Bezier(A, aHandle, B, bHandle, i.float / repeats.float)
    dir = MoveToPoint(lastPos, pos, 1.0)
    perp = giveDirFor90degrToLine(lastPos, pos)
    
    wdth = 2
    pastQd = [pos - perp*wdth + dir, pos + perp*wdth + dir, lastPos + lastPerp*wdth - lastDir, lastPos - lastPerp*wdth - lastDir]
    pastQd = pastQd - [gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20, gRenderCameraTilePos*20]
    
    myDp = lerp(aDp, bDp, i.float / repeats.float).integer
    
    repeat with i2 = 1 to 3 then
      if(myDp + i2 <= 30)then
        member("layer"&string(myDp + i2 - 1)).image.copyPixels(member("thickWireGraf").image, pastQd, rect(0,(i2-1)*4,4,i2*4), {#ink:36})
      else 
        exit repeat
      end if
    end repeat
    
    lastPos = pos
    lastDir = dir
    lastPerp = perp
  end repeat
  
  
end



on initRenderSoftProp(prop, qd, propData, dp)
  
  lft = qd[1].locH
  tp = qd[1].locV
  rght = qd[1].locH
  bttm = qd[1].locV
  
  repeat with p in qd then
    if(p.locH < lft) then
      lft = p.locH
    end if
    if(p.locH > rght) then
      rght = p.locH
    end if
    if(p.locV < tp) then
      tp = p.locV
    end if
    if(p.locV > bttm) then
      bttm = p.locV
    end if
  end repeat
  
  pasteRect = rect(lft, tp, rght, bttm)
  offsetPnt = point(lft, tp)
  member("softPropRender").image = image(pasteRect.width, pasteRect.height, 32)
  
  getRect = member("previewImprt").image.rect
  if(prop.tp = "variedSoft")then
    getRect = rect((propData.settings.variation-1)*prop.pxlSize.locH, 0, propData.settings.variation*prop.pxlSize.locH, prop.pxlSize.locV) + rect(0,1,0,1)
  end if
  
  member("softPropRender").image.copyPixels(member("previewImprt").image, qd-[offsetPnt, offsetPnt, offsetPnt, offsetPnt], getRect)
  
  if(prop.tp = "variedSoft")then
    if(prop.colorize = 1)then
      if(propData.settings.applyColor)then
        gAnyDecals = true
        member("softPropColor").image = image(pasteRect.width, pasteRect.height, 32)
        member("softPropColor").image.copyPixels(member("previewImprt").image, qd-[offsetPnt, offsetPnt, offsetPnt, offsetPnt], getRect+rect(0, getRect.height, 0, getRect.height))
      end if
    end if
  end if
  
  clr = 0
  if(propData.settings.findPos(#color) <> void) then
    if(propData.settings.color > 0)then
      global gPEcolors
      clr = gPEcolors[propData.settings.color][2]
      gAnyDecals = 1
    end if
  end if
  
  softProp = [#c:0, #pasteRect:pasteRect, #prop:prop, #propData:propData, #dp:dp, #clr:clr]
  
  repeat with q = 0 to 29 then
    sprite(50-q).color = color(0,0,0)
  end repeat
end

on renderSoftProp()
  
  repeat with q2 = 0 to softProp.pasteRect.width-1 then
    clr = member("softPropRender").image.getPixel(q2, softProp.c)
    if(clr <> color(255, 255, 255)) and ((clr.green > 0) or (softProp.prop.tp = "antimatter")) then
      dpth = clr.green/255.0
      
      if(softProp.prop.tp = "antimatter")then
        renderFrom = softProp.dp
        renderTo = restrict((softProp.dp + softProp.propData.settings.customDepth*(1.0-dpth)).integer, 0, 29)
        painted = false
        repeat with d = renderFrom to renderTo then
          dp = restrict(renderTo - d + renderFrom, 0, 29)
          
          if member("layer"&dp).image.getPixel(q2+softProp.pasteRect.left, softProp.c+softProp.pasteRect.top) <> color(255, 255, 255) then
            member("layer"&dp).image.setPixel(q2+softProp.pasteRect.left, softProp.c+softProp.pasteRect.top, color(255, 255, 255))
            if(painted = false) then
              repeat with clr in [[color(255, 0, 0), -1], [color(0, 0, 255), 1]] then
                repeat with dir in [point(1,0), point(1,-1), point(0,1), point(2,0), point(2,-2), point(0,2)]then
                  if member("layer"&dp).image.getPixel(q2+softProp.pasteRect.left+dir.locH*clr[2], softProp.c+softProp.pasteRect.top+dir.locV*clr[2]) <> color(255, 255, 255) then
                    member("layer"&dp).image.setPixel(q2+softProp.pasteRect.left+dir.locH*clr[2], softProp.c+softProp.pasteRect.top+dir.locV*clr[2], clr[1])
                  end if
                end repeat
              end repeat
              painted = true
            end if
          end if
        end repeat
        
      else
        palCol = color(0,255,0)
        
        if (softProp.prop.selfShade = 0)then
          if(clr.blue > (255.0/3.0)*2.0) then
            palCol = color(0,0,255)
          else if(clr.blue < 255.0/3.0) then
            palCol = color(255, 0,0)
          end if
        else
          
          ang = 0.0
          repeat with a = 1 to softProp.prop.smoothShading then
            repeat with pnt in [point(1, 0), point(1,1), point(0,1)]then
              --  put dpth & " " & ang & " " & softPropDepth(point(q2, softProp.c)-pnt*a) & " " & softPropDepth(point(q2, softProp.c)+pnt*a)
              ang = ang + (dpth - softPropDepth(point(q2, softProp.c)-pnt*a)) + (softPropDepth(point(q2, softProp.c)+pnt*a) - dpth)
            end repeat
          end repeat
          ang = ang / (softProp.prop.smoothShading.float*3.0)
          
          ang = ang * (1.0-clr.red/255.0)
          
          if(ang*10.0*power(dpth, softProp.prop.depthAffectHilites) > softProp.prop.highLightBorder)then
            palCol = color(0,0,255)
          else if(-ang*10.0 > softProp.prop.shadowBorder) then
            palCol = color(255, 0,0)
          end if
        end if
        
        
        dpth = 1.0-dpth
        dpth = power(dpth, softProp.prop.contourExp)
        
        dpthRemove = (dpth * softProp.propData.settings.customDepth)
        
        renderFrom = 0
        renderTo = 0
        
        if(softProp.prop.round)then
          renderFrom =  softProp.dp + (dpthRemove/2.0)
          renderTo = softProp.dp + softProp.propData.settings.customDepth - (dpthRemove/2.0)
        else
          renderFrom = softProp.dp + dpthRemove
          renderTo = softProp.dp + softProp.propData.settings.customDepth
        end if
        
        renderFrom = lerp(renderFrom, softProp.dp + dpthRemove, clr.red/255.0)
        renderTo = lerp(renderTo, softProp.dp + dpthRemove, clr.red/255.0)
        
        repeat with dp = restrict(renderFrom.integer, 0, 29) to restrict(renderTo.integer, 0, 29)then
          member("layer"&dp).image.setPixel(q2+softProp.pasteRect.left, softProp.c+softProp.pasteRect.top, palCol)
        end repeat
        
        clrzClr = color(255, 255, 255)
        
        if(softProp.clr <> 0)then
          clrzClr = softProp.clr
        else  if(softProp.prop.tp = "variedSoft")then
          if(softProp.prop.colorize = 1)then
            if(softProp.propData.settings.applyColor)then
              clrzClr = member("softPropColor").image.getPixel(q2, softProp.c)
            end if
          end if
        end if
        
        if(clrzClr <> color(255, 255, 255))then
          repeat with dp = restrict(renderFrom.integer, 0, 29) to restrict(renderTo.integer, 0, 29)then
            member("layer"&dp&"dc").image.setPixel(q2+softProp.pasteRect.left, softProp.c+softProp.pasteRect.top, clrzClr)
          end repeat
        end if
        
      end if
    end if
  end repeat
  
  softProp.c = softProp.c + 1
  if(softProp.c >= softProp.pasteRect.height)then
    repeat with q = 0 to 29 then
      val = (q.float+1.0)/30.0
      sprite(50-q).color = color(val*255, val*255, val*255)
    end repeat
    softProp = void
  end if
end

on softPropDepth(pxl)
  clr = member("softPropRender").image.getPixel(pxl.locH, pxl.locV)
  if(clr = color(255, 255, 255)) or (clr = 0) then
    return 0.0
  end if
  
  return clr.green/255.0
end

on renderESoftProp()
  
  repeat with q2 = 0 to softProp.pasteRect.width-1 then
    clr = member("softPropRender").image.getPixel(q2, softProp.c)
    if(clr <> color(255, 255, 255)) then
      if (clr.green > 0)then
        dpth = clr.green/255.0
      else if (clr.blue > 0)then
        dpth = clr.blue/255.0
      else
        dpth = clr.red/255.0
      end if
      
      palCol = color(0,255,0)
      
      ang = 0.0
      repeat with a = 1 to softProp.prop.smoothShading then
        repeat with pnt in [point(1, 0), point(1,1), point(0,1)]then
          --  put dpth & " " & ang & " " & softPropDepth(point(q2, softProp.c)-pnt*a) & " " & softPropDepth(point(q2, softProp.c)+pnt*a)
          ang = ang + (dpth - EsoftPropDepth(point(q2, softProp.c)-pnt*a)) + (EsoftPropDepth(point(q2, softProp.c)+pnt*a) - dpth)
        end repeat
      end repeat
      ang = ang / (softProp.prop.smoothShading.float*3.0)
      
      ang = ang * (1.0/255.0)
      
      if(ang*10.0*power(dpth, softProp.prop.depthAffectHilites) > softProp.prop.highLightBorder)then
        palCol = color(0,0,255)
      else if(-ang*10.0 > softProp.prop.shadowBorder) then
        palCol = color(255, 0,0)
      end if
      
      dpth = 1.0-dpth
      dpth = power(dpth, softProp.prop.contourExp)
      
      dpthRemove = (dpth * softProp.propData.settings.customDepth)
      
      renderFrom = 0
      renderTo = 0
      
      if(softProp.prop.round)then
        renderFrom =  softProp.dp + (dpthRemove/2.0)
        renderTo = softProp.dp + softProp.propData.settings.customDepth - (dpthRemove/2.0)
      else
        renderFrom = softProp.dp + dpthRemove
        renderTo = softProp.dp + softProp.propData.settings.customDepth
      end if
      
      renderFrom = lerp(renderFrom, softProp.dp + dpthRemove, clr.red/255.0)
      renderTo = lerp(renderTo, softProp.dp + dpthRemove, clr.red/255.0)
      
      repeat with dp = restrict(renderFrom.integer, 0, 29) to restrict(renderTo.integer, 0, 29)then
        member("layer"&dp).image.setPixel(q2+softProp.pasteRect.left, softProp.c+softProp.pasteRect.top, palCol)
      end repeat
      
      clrzClr = color(255, 255, 255)
      
      if(softProp.clr <> 0)then
        clrzClr = softProp.clr
      else  if(softProp.prop.tp = "variedSoft")then
        if(softProp.prop.colorize = 1)then
          if(softProp.propData.settings.applyColor)then
            clrzClr = member("softPropColor").image.getPixel(q2, softProp.c)
          end if
        end if
      end if
      
      if(clrzClr <> color(255, 255, 255))then
      if (clr.blue > 0)then
        clrzClr.green = 1
      else if (clr.red > 0)then
        clrzClr.green = 2
      end if
        repeat with dp = restrict(renderFrom.integer, 0, 29) to restrict(renderTo.integer, 0, 29)then
          member("layer"&dp&"dc").image.setPixel(q2+softProp.pasteRect.left, softProp.c+softProp.pasteRect.top, clrzClr)
        end repeat
      end if
      
    end if
  end repeat
  
  softProp.c = softProp.c + 1
  if(softProp.c >= softProp.pasteRect.height)then
    repeat with q = 0 to 29 then
      val = (q.float+1.0)/30.0
      sprite(50-q).color = color(val*255, val*255, val*255)
    end repeat
    softProp = void
  end if
end

on EsoftPropDepth(pxl)
  clr = member("softPropRender").image.getPixel(pxl.locH, pxl.locV)
  if(clr = color(255, 255, 255)) or (clr = 0) then
    return 0.0
  end if
  if (clr.green > 0)then
    return clr.green/255.0
  else if (clr.blue > 0)then
    return clr.blue/255.0
  else
    return clr.red/255.0
  end if
end




on renderLongProp(qd, prop, data, dp)
  A = (qd[1]+qd[4])/2.0
  B = (qd[2]+qd[3])/2.0
  
  dir = MoveToPoint(A, B, 1.0)
  perp = CorrectPerp(dir)
  dist = Diag(A, B)
  
  
  
  case (prop.nm) of
    "Cabinet Clamp":
      mem = member("clampSegmentGraf")
      totalSegments = ((dist/mem.image.height)-0.5).integer
      buffer = dist - (totalSegments * mem.image.height)
      
      qd2 = [A - (perp*mem.image.width*0.5) + (dir*buffer*0.5), A + (perp*mem.image.width*0.5) + (dir*buffer*0.5), A + (perp*mem.image.width*0.5), (A - perp*mem.image.width*0.5)]
      member("layer" & dp).image.copyPixels(member("pxl").image, qd2, rect(0,0,1,1), {#color:color(0, 255, 0)})
      qd2 = [B - (perp*mem.image.width*0.5) - (dir*buffer*0.5), B + (perp*mem.image.width*0.5) - (dir*buffer*0.5), B + (perp*mem.image.width*0.5), (B - perp*mem.image.width*0.5)]
      member("layer" & dp).image.copyPixels(member("pxl").image, qd2, rect(0,0,1,1), {#color:color(0, 255, 0)})
      
      d = buffer/2.0
      
      repeat with q = 1 to totalSegments then
        
        pnt = A + d*dir
        qd2 = [pnt - (perp*mem.image.width*0.5) + (dir*mem.image.height), pnt + (perp*mem.image.width*0.5) + (dir*mem.image.height), pnt + (perp*mem.image.width*0.5), (pnt - perp*mem.image.width*0.5)]
        member("layer" & dp).image.copyPixels(mem.image, qd2, mem.image.rect, {#color:color(0, 255, 0), #ink:36})
        
        d = d + mem.image.height
      end repeat
      
      mem = member("clampBoltGraf")
      member("layer" & dp).image.copyPixels(mem.image, rect(A,A) + rect(-mem.image.width/2, -mem.image.height/2, mem.image.width/2, mem.image.height/2), mem.image.rect, {#ink:36})
      member("layer" & dp).image.copyPixels(mem.image, rect(B,B) + rect(-mem.image.width/2, -mem.image.height/2, mem.image.width/2, mem.image.height/2), mem.image.rect, {#ink:36})
    "Thick Chain":
      
      steps = ((diag(A, B)/12.0)+0.4999).integer
      ornt = random(2)-1
      degDir = lookatpoint(A, B)
      stp = random(100)*0.01
      repeat with q = 1 to steps then
        pos = A+(dir*12*(q-stp))
        if ornt then
          --   pos = (pnt+lastPnt)*0.5
          rct = rect(pos,pos)+rect(-6,-10,6,10)
          gtRect = rect(0,0,12,20)
          ornt = 0
        else
          -- pos = (pnt+lastPnt)*0.5
          rct = rect(pos,pos)+rect(-2,-10,2,10)
          gtRect = rect(13,0,16,20)
          ornt = 1
        end if
        -- put rct
        member("layer"&string(dp)).image.copypixels(member("bigChainSegment").image, rotateToQuad(rct, degDir), gtRect, {#color:color(255, 0, 5), #ink:36})
        -- member("layer"&string(dp)).image.copypixels(member("bigChainSegment").image, rct, member("bigChainSegment").image.rect, {#color:color(255,0,0), #ink:36})
      end repeat
      
    "Drill Suspender":
      thirdDist = dist/4.0
      
      repeat with q = 1 to 2 then
        ps = A
        dr = dir
        if(q = 2) then
          ps = B
          dr = -dir
        end if
        
        QD = [ps - perp, ps + perp, ps + dr*thirdDist + perp, ps + dr*thirdDist - perp]
        member("layer" & restrict(dp+3, 0, 29)).image.copyPixels(member("pxl").image, QD, rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
        
        QD = [ps - perp*2, ps + perp*2, ps + dr*10.0 + perp*2, ps + dr*10.0 - perp*2]
        member("layer" & restrict(dp+3, 0, 29)).image.copyPixels(member("pxl").image, QD, rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
        
        rodWidth = 18.0
        QD =  [ps + dr*thirdDist - perp*rodWidth, ps + dr*thirdDist + perp*rodWidth, ps + dr*(thirdDist - 2.5) + perp*rodWidth, ps + dr*(thirdDist - 2.5) - perp*rodWidth]
        member("layer" & restrict(dp+3, 0, 29)).image.copyPixels(member("pxl").image, QD, rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
        
        QD =  [ps + dr*thirdDist - perp*3, ps + dr*thirdDist + perp*3, ps + dr*thirdDist - perp*3 - dr*28, ps + dr*thirdDist + perp*3 - dr*28]
        QD = QD + [dr*2, dr*2, dr*2, dr*2]
        repeat with e = 0 to 2 then
          member("layer" & restrict(dp+2+e, 0, 29)).image.copyPixels(member("DrillSuspenderClamp").image, QD, rect(0, restrict(e, 0, 1)*28, 6, (restrict(e, 0, 1)+1)*28), {#ink:36})
        end repeat
        
        member("layer" & restrict(dp+2, 0, 29)).image.copyPixels(member("DrillSuspenderBolt").image, rect(ps,ps)+rect(-3,-3,3,3), rect(0,0,6,6), {#ink:36})
        repeat with e = 3 to 4 then
          member("layer" & restrict(dp+e, 0, 29)).image.copyPixels(member("DrillSuspenderBolt").image, rect(ps,ps)+rect(-4,-4,4,4), rect(0,6,8,14), {#ink:36})
        end repeat
      end repeat
      
      repeat with q = 1 to 2 then
        perpOffset = -10.0
        if(q = 2)then
          perpOffset = 10.0
        end if
        
        rodWidth = 0.65
        
        QD = [A + dir*thirdDist - perp*(-rodWidth + perpOffset), A + dir*thirdDist - perp*(rodWidth + perpOffset), B - dir*thirdDist - perp*(rodWidth + perpOffset), B - dir*thirdDist - perp*(-rodWidth + perpOffset)]
        member("layer" & restrict(dp+3, 0, 29)).image.copyPixels(member("pxl").image, QD, rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
        
        repeat with e = 1 to 2 then
          pos = A + dir*thirdDist - perp*perpOffset
          if(e = 2)then
            pos = B - dir*thirdDist - perp*perpOffset
          end if
          
          repeat with d = 0 to 5 then
            sz = 3.0 + 7.0*sin((d/5.0)*PI)
            QD = [pos+dir*sz-perp, pos+dir*sz+perp, pos-dir*sz+perp, pos-dir*sz-perp]
            member("layer" & restrict(dp+d, 0, 29)).image.copyPixels(member("pxl").image, QD, rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
          end repeat
          
        end repeat
      end repeat
      
      
    "Drill":
      
      steps = ((diag(A, B)/20.0)+0.4999).integer
      degDir = lookatpoint(A, B)
      stp = random(100)*0.01
      repeat with q = 1 to steps then
        pos = A+(dir*20.0*(q-stp))
        rct = rect(pos,pos)+rect(-10,-10,10,10)
        
        repeat with e = 0 to 9 then
          member("layer"&string(restrict(dp+e, 0, 29))).image.copypixels(member("DrillGraf").image, rotateToQuad(rct, degDir), rect(0, e*20, 20, (e+1)*20), {#ink:36})
        end repeat
      end repeat
      
    "Piston":
      dr = dir
      repeat with d = 0 to 2 then
        wdth = 3 + d
        QD = [A - perp * wdth, A + perp * wdth, B + perp * wdth, B - perp * wdth]
        member("layer" & restrict(dp+d+1, 0, 29)).image.copyPixels(member("pxl").image, QD, rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
        
        member("layer" & restrict(dp+d+1, 0, 29)).image.copyPixels(member("pistonHead").image, rect(A.locH - 5, A.locV - 5, A.locH + 5, A.locV + 5), member("pistonHead").image.rect, {#ink:36})
      end repeat
      wdth = 1
      QD = [A + dir - perp * wdth, A + dir + perp * wdth, B - dir + perp * wdth, B - dir - perp * wdth] + [point(-1,-1), point(-1,-1), point(-1,-1), point(-1,-1)]
      member("layer" & restrict(dp+1, 0, 29)).image.copyPixels(member("pxl").image, QD, rect(0,0,1,1), {#ink:36, #color:color(0, 0, 255)})
      
      A2 = A
      if(diag(a,b) > 200) then
        A2 = B + MoveToPoint(b, a, 200.0)
      end if
      repeat with d = 0 to 4 then
        wdth = 5 + d + (d > 0)
        QD = [A2 - perp * wdth, A2 + perp * wdth, B + perp * wdth, B - perp * wdth]
        member("layer" & restrict(dp+d, 0, 29)).image.copyPixels(member("pxl").image, QD, rect(0,0,1,1), {#ink:36, #color:color(0, 255, 0)})
        
        if(d = 0)then
          wdth = 3
          QD = [A2 + dir*2 - perp * wdth, A2 + dir*2 + perp * wdth, B - dir*2 + perp * wdth, B - dir*2 - perp * wdth] + [point(-2,-2), point(-2,-2), point(-2,-2), point(-2,-2)]
          member("layer" & restrict(dp, 0, 29)).image.copyPixels(member("pxl").image, QD, rect(0,0,1,1), {#ink:36, #color:color(0, 0, 255)})
        end if
        
        QD = [A2 - perp * wdth, A2 + perp * wdth, A2 + dir * 2 + perp * wdth, A2 + dir * 2 - perp * wdth]
        member("layer" & restrict(dp+d, 0, 29)).image.copyPixels(member("pxl").image, QD, rect(0,0,1,1), {#ink:36, #color:color(255, 0, 0)})
      end repeat
      
      
  end case
  
end




on DoPropTags(prop, dp, qd)
  repeat with i = 1 to prop.tags.count then
    case prop.tags[i] of
      "Circular Sign":
        -- put "CIRCLE SIGN"
        
        img = image(120,120,1)
        rnd = random(14)
        img.copyPixels(member("circularSigns").image, rect(0,0,120, 120), rect((rnd-1)*120, 1 + 240, rnd*120, 1 + 240 + 120), {#ink:36, #color:color(0,0,0)})
        
        
        mdPnt = (qd[1] + qd[2] + qd[3] + qd[4])/4.0
        
        repeat with r in [[point(-1,-1), color(0,0,255)], [point(-0,-1), color(0,0,255)], [point(-1,-0), color(0,0,255)], [point(-2,-2), color(0,0,255)], [point(1,1), color(255,0,0)],[point(0,1), color(255,0,0)],[point(1,0), color(255,0,0)],[point(2,2), color(255,0,0)],[point(0,0), color(0,255,0)]] then
          
          member("layer" & string(restrict(dp, 0, 29))).image.copyPixels(img, rect(-60,-60,60,60)+rect(mdPnt,mdPnt)+rect(r[1],r[1]), rect(0,0,120,120), {#ink:36, #color:r[2]})
          
        end repeat
        
        member("layer" & string(dp)).image.copyPixels(member("circularSigns").image, rect(-60,-60,60,60)+rect(mdPnt,mdPnt), rect((rnd-1)*120, 1+120, rnd*120, 1 + 240), {#ink:36, #color:color(0,255,0)})
        member("layer" & string(dp)).image.copyPixels(member("circularSigns").image, rect(-60,-60,60,60)+rect(mdPnt,mdPnt), rect((rnd-1)*120, 1, rnd*120, 1 + 120), {#ink:36, #color:color(255,0,255)})
        
        copyPixelsToEffectColor("A", dp, rect(mdPnt+point(-60,-60),mdPnt+point(60,60)), "circleSignGrad", rect(0, 1, 120, 121), 0.5, 1)
    end case
  end repeat
end














